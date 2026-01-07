use config::{Config, File};
use serde::Deserialize;
use std::path::Path;
use std::sync::OnceLock;

#[derive(Debug, Deserialize, Clone)]
pub struct LogConf {
    pub level: String,
    pub output: String,
    pub output_path: String,
}

impl Default for LogConf {
    fn default() -> Self {
        LogConf {
            level: "debug".to_string(),
            output: "Console".to_string(),
            output_path: "./logs/".to_string(),
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct WebConf {
    pub host: String,
    pub port: u16,
}

impl Default for WebConf {
    fn default() -> Self {
        WebConf {
            host: "0.0.0.0".to_string(),
            port: 8080,
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct RepoConf {
    pub wpl_rule_repo: String,
    pub oml_rule_repo: String,
}

impl Default for RepoConf {
    fn default() -> Self {
        RepoConf {
            wpl_rule_repo: default_project_root(),
            oml_rule_repo: default_oml_rule_repo(),
        }
    }
}

#[derive(Debug, Deserialize, Clone, Default)]
pub struct Setting {
    pub log: LogConf,
    pub web: WebConf,
    pub repo: RepoConf,
}

fn default_oml_rule_repo() -> String {
    "./rules/models/oml".to_string()
}

fn default_project_root() -> String {
    "./rules".to_string()
}

impl Setting {
    pub fn load() -> Self {
        static SETTING: OnceLock<Setting> = OnceLock::new();

        SETTING
            .get_or_init(|| {
                let config_path = "config/config.toml";
                let mut builder = Config::builder();

                // 如果配置文件存在，就加载它，否则使用默认配置
                if Path::new(&config_path).exists() {
                    builder = builder.add_source(File::with_name(config_path));
                }

                // 使用构建器加载配置，如果失败则使用默认值
                builder
                    .build()
                    .unwrap_or_else(|_| {
                        // 配置文件加载失败，使用默认配置
                        warn!("配置文件加载失败，使用默认配置");
                        Config::builder().build().unwrap()
                    })
                    .try_deserialize()
                    .unwrap_or_else(|_| {
                        // 配置文件解析失败，使用默认配置
                        warn!("配置文件解析失败，使用默认配置");
                        Setting::default()
                    })
            })
            .clone()
    }
}
