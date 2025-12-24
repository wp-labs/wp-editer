// 工具模块

pub mod oml;
pub mod wpl;

pub use oml::convert_record;
pub use wpl::{ParsedField, record_to_fields, warp_check_record};
