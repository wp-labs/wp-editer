use crate::{OmlFormatter, WplFormatter};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs::File, io::Read, path::PathBuf};
use wp_wpl::WplCode;

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct WplExample {
    pub name: String,
    pub wpl_code: String,
    pub oml_code: String,
    pub sample_data: String,
}

pub fn wpl_examples(
    wpl_dir: PathBuf,
    oml_dir: PathBuf,
    examples: &mut HashMap<String, WplExample>,
) -> Result<(), Box<dyn std::error::Error>> {
    if wpl_dir.is_file() {
        if wpl_dir.extension().and_then(|ext| ext.to_str()) != Some("wpl") {
            return Ok(());
        }
        let wpl_formatter = WplFormatter::new();
        let oml_formatter = OmlFormatter::new();
        let mut example = WplExample::default();
        let mut file = File::open(&wpl_dir)?;
        // 获取原始的wpl代码
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        example.wpl_code = wpl_formatter.format_content(&contents);
        // 获取日志示例数据
        let sample_data_dir = wpl_dir.parent().unwrap().join("sample.dat");
        let mut sample_data = String::new();
        if sample_data_dir.is_file() {
            let mut file = File::open(&sample_data_dir)?;
            file.read_to_string(&mut sample_data)?;
        }
        example.sample_data = sample_data.clone();

        let code = WplCode::build(wpl_dir.clone(), &contents)
            .map_err(|e| anyhow::anyhow!("build example wpl failed: {}", e))?;

        let pkg = code
            .parse_pkg()
            .map_err(|e| anyhow::anyhow!("parse example wpl failed: {}", e))?;
        let pkg_name = pkg
            .name()
            .to_string()
            .strip_prefix('/')
            .unwrap_or(&pkg.name)
            .strip_suffix('/')
            .unwrap_or(&pkg.name)
            .to_string();
        example.name = pkg_name.clone();

        pkg.rules.iter().for_each(|rule| {
            let rule_name = rule
                .name()
                .to_string()
                .strip_prefix('/')
                .unwrap_or(&rule.name)
                .to_string();
            let oml_dir = oml_dir.join(pkg_name.as_str()).join(&rule_name);
            if oml_dir.is_dir()
                && let Ok(entries) = oml_dir.read_dir()
            {
                entries.for_each(|entry| {
                    if let Ok(entry) = entry {
                        let path = entry.path();
                        if path.extension().map(|ext| ext == "oml").unwrap_or(false)
                            && let Ok(mut file) = File::open(&path)
                        {
                            let mut oml_contents = String::new();
                            let res = file.read_to_string(&mut oml_contents);
                            if res.is_ok() {
                                example.oml_code = oml_formatter.format_content(&oml_contents);
                            }
                        }
                    }
                });
            }
        });
        examples.insert(example.name.clone(), example);
        return Ok(());
    }
    wpl_dir.read_dir()?.for_each(|entry| {
        if let Ok(entry) = entry {
            let path = entry.path();
            let _ = wpl_examples(path, oml_dir.clone(), examples);
        }
    });
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    // #[test]
    // fn demo() {
    //     let file_path = PathBuf::from("rules/models/wpl");
    //     let mut examples = HashMap::new();

    //     let result = wpl_examples(file_path, &mut examples);
    //     println!("{:?}", examples);
    //     assert!(result.is_ok());
    // }
    #[test]
    fn test_wpl_examples_with_directory() {
        let temp_dir = TempDir::new().unwrap();
        let sub_dir = temp_dir.path().join("subdir");
        fs::create_dir(&sub_dir).unwrap();
        let file_path = sub_dir.join("nested.wpl");
        let wpl_content = r#"package /nested/ {
   rule nested_rule {
        (ip:sip)
   }
}"#;
        fs::write(&file_path, wpl_content).unwrap();

        let mut examples = HashMap::new();
        let result = wpl_examples(
            temp_dir.path().to_path_buf(),
            temp_dir.path().to_path_buf(),
            &mut examples,
        );

        assert!(result.is_ok());
        assert_eq!(examples.len(), 1);
        assert!(
            examples.contains_key("nested"),
            "示例应以去除首尾斜杠的包名作为键"
        );
    }

    #[test]
    fn test_wpl_examples_with_invalid_content() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("invalid.wpl");
        let invalid_content = "this is not valid wpl content";
        fs::write(&file_path, invalid_content).unwrap();

        let mut examples = HashMap::new();
        let result = wpl_examples(file_path, temp_dir.path().to_path_buf(), &mut examples);
        assert!(result.is_err());
    }

    #[test]
    fn test_wpl_examples_non_existent_path() {
        let non_existent = PathBuf::from("/non/existent/path/xyz.wpl");
        let mut examples = HashMap::new();

        let result = wpl_examples(non_existent.clone(), non_existent, &mut examples);
        assert!(result.is_err());
    }
}
