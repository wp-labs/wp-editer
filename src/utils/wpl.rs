use std::path::PathBuf;

use crate::error::AppError;
use serde::{Deserialize, Serialize};
use wp_engine::sources::event_id::next_event_id;
use wp_model_core::model::{DataField, DataRecord, DataType};
use wp_parse_api::RawData;
use wp_wpl::{AnnotationType, WplCode, WplEvaluator, WplExpress, WplPackage, WplStatementType};

type RunParseProc = (WplExpress, Vec<AnnotationType>);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ParsedField {
    pub no: i32,
    pub meta: String,
    pub name: String,
    pub value: String,
}

// 将 DataRecord 转换为 ParsedField 列表
pub fn record_to_fields(record: &DataRecord) -> Vec<ParsedField> {
    record
        .items
        .iter()
        .enumerate()
        .map(|(index, field)| ParsedField {
            no: index as i32 + 1,
            meta: field.meta.to_string(),
            name: field.name.to_string(),
            value: field.value.to_string(),
        })
        .collect()
}

// 内部/其他模块使用：返回原始 DataRecord，供 OML 等后续处理
pub fn warp_check_record(wpl: &str, data: &str) -> Result<DataRecord, AppError> {
    // 保留解析错误中的换行与指示符，避免转义
    let code = WplCode::build(PathBuf::from(""), wpl).map_err(AppError::wpl_parse)?;
    let wpl_package = code.parse_pkg().map_err(AppError::wpl_parse)?;
    // let wpl_package = parse_wpl_package(wpl)?;
    let rule_items = extract_rule_items(&wpl_package)
        .map_err(|err| AppError::wpl_parse_msg(format!("构建 WPL 规则失败: {:?}", err)))?;

    if rule_items.is_empty() {
        return Err(AppError::wpl_parse_msg("WPL 中未找到任何规则"));
    }
    try_parse_with_rules(rule_items, data)
}

/// 尝试用规则列表解析数据
fn try_parse_with_rules(rule_items: Vec<RunParseProc>, data: &str) -> Result<DataRecord, AppError> {
    for (index, (vm_unit, _funcs)) in rule_items.iter().enumerate() {
        let evaluator = WplEvaluator::from(vm_unit, None).map_err(AppError::wpl_parse)?;
        let raw = RawData::from_string(data.to_string());
        match evaluator.proc(raw, 0) {
            Ok((mut tdc, _pipeline)) => {
                if let Some(tags) = vm_unit.tags.clone() {
                    for tag in tags.export_tags() {
                        tdc.append(DataField::from_chars(tag.key.clone(), tag.val.clone()));
                    }
                }
                tdc.append(DataField::from_digit("wp_event_id", next_event_id() as i64));
                tdc.items.retain(|item| item.meta != DataType::Ignore);
                return Ok(DataRecord { items: tdc.items });
            }
            Err(err) => {
                println!("WPL 规则 {} 执行失败: {:#?}", index + 1, err);
                if index >= rule_items.len() - 1 {
                    return Err(AppError::wpl_parse(err));
                }
            }
        }
    }
    Err(AppError::wpl_parse_msg("所有 WPL 规则执行失败"))
}

fn extract_rule_items(wpl_package: &WplPackage) -> anyhow::Result<Vec<RunParseProc>> {
    let mut rule_pairs = Vec::with_capacity(wpl_package.rules.len());

    for rule in wpl_package.rules.iter() {
        let rule_obj = match &rule.statement {
            WplStatementType::Express(code) => code.clone(),
        };
        let funcs = AnnotationType::convert(rule.statement.tags());
        rule_pairs.push((rule_obj, funcs));
    }
    Ok(rule_pairs)
}
