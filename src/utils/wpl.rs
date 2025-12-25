use crate::error::AppError;
use serde::{Deserialize, Serialize};
use wp_model_core::model::DataRecord;
use wp_parse_api::RawData;
use wp_parser::comment::CommentParser;

use wp_wpl::{AnnotationType, WplEvaluator, WplExpress, WplPackage, WplStatementType, wpl_package};

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
            name: field.name.clone(),
            value: field.value.to_string(),
        })
        .collect()
}

/// 解析 WPL 代码为包结构
fn parse_wpl_package(wpl: &str) -> Result<WplPackage, AppError> {
    let mut wpl_code = wpl;
    let code_without_comments =
        CommentParser::ignore_comment(&mut wpl_code).map_err(AppError::wpl_parse)?;

    wpl_package(&mut code_without_comments.as_str())
        .map_err(|err| AppError::wpl_parse(format!("WPL 包解析错误: {:?}", err)))
}

// 内部/其他模块使用：返回原始 DataRecord，供 OML 等后续处理
pub fn warp_check_record(wpl: &str, data: &str) -> Result<DataRecord, AppError> {
    let wpl_package = parse_wpl_package(wpl)?;
    let rule_items = extract_rule_items(&wpl_package)
        .map_err(|err| AppError::wpl_parse(format!("构建 WPL 规则失败: {:?}", err)))?;

    if rule_items.is_empty() {
        return Err(AppError::wpl_parse("WPL 中未找到任何规则"));
    }

    try_parse_with_rules(rule_items, data)
}

/// 尝试用规则列表解析数据
fn try_parse_with_rules(rule_items: Vec<RunParseProc>, data: &str) -> Result<DataRecord, AppError> {
    for (index, (vm_unit, _funcs)) in rule_items.iter().enumerate() {
        let evaluator = WplEvaluator::from(vm_unit, None).map_err(AppError::wpl_parse)?;
        let raw = RawData::from_string(data.to_string());
        match evaluator.proc(raw, 0){
            Ok((tdc, _pipeline)) => return Ok(tdc),
            Err(err) => {
                if index >= rule_items.len() - 1 {
                    return Err(AppError::wpl_parse(err));
                }
            }
        }      
    }
    Err(AppError::wpl_parse("所有 WPL 规则执行失败"))
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
