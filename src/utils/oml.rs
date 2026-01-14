use std::fmt::Display;

use crate::error::AppError;
use orion_error::{DomainReason, ErrorCode, StructError};
use wp_data_utils::cache::FieldQueryCache;
use wp_error::{OMLCodeError, OMLCodeReason};
use wp_model_core::model::DataRecord;
use wp_oml::{core::DataTransformer, parser::oml_parse};

pub fn convert_record(oml: &str, record: DataRecord) -> Result<DataRecord, AppError> {
    // 预处理：去除注释
    let filter_oml = oml
        .lines()
        .map(|line| {
            if let Some(comment_start) = line.find("//") {
                &line[0..comment_start]
            } else {
                line
            }
        })
        .collect::<Vec<_>>()
        .join("\n");
    let model = oml_parse(&mut filter_oml.as_str(), "")
        //.map_err(|e| OMLCodeError::from_syntax(e, oml, ""))
        .map_err(|e| AppError::OmlTransform(print_error(&e)))?;
    let mut cache = FieldQueryCache::with_capacity(10);
    let target = model.transform(record, &mut cache);
    Ok(target)
}

pub fn print_error(err: &OMLCodeError) -> String {
    format!("{}", err)
}
