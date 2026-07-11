"""集中式配置, 从环境变量读取 (见 docker-compose.yml)。"""
from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- 面板登录 ---
    panel_username: str = "admin"
    panel_password: str = "admin"
    jwt_secret: str = "dev-insecure-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 12

    # --- 目标游戏服务器 ---
    pal_container_name: str = "palworld-server"
    pal_rest_base: str = "http://palworld-server:8212"
    # 与游戏容器共用 server.env: 认证密码来自 ADMIN_PASSWORD
    pal_admin_password: str = Field(
        default="",
        validation_alias=AliasChoices("PAL_ADMIN_PASSWORD", "ADMIN_PASSWORD"),
    )
    pal_rcon_host: str = "palworld-server"
    pal_rcon_port: int = Field(
        default=25575,
        validation_alias=AliasChoices("PAL_RCON_PORT", "RCON_PORT"),
    )

    # --- 数据目录 (容器内路径) ---
    pal_data_dir: str = "/data/palworld"
    pal_backup_dir: str = "/data/backup"

    # REST API 固定管理员账号
    pal_rest_username: str = "admin"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
