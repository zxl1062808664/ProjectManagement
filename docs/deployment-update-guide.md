# Task Atlas 云服务器更新说明

本文档适用于当前部署：Ubuntu 云服务器、Node.js 24、systemd、SQLite。

## 当前部署信息

- 服务器：`1.14.190.127`
- SSH 用户：`root`
- 应用运行用户：`taskatlas`
- 项目目录：`/home/taskatlas/task-atlas`
- 数据库：`/home/taskatlas/task-atlas/data/task-atlas.sqlite`
- 服务名：`task-atlas`
- Web 端口：`55377`

不要把本地的 `data/task-atlas.sqlite` 放进代码更新压缩包。云端数据库包含线上账号和任务数据，更新代码时必须保留它。

## 1. 本地检查

在项目根目录执行：

```powershell
npm ci
npm run check
npm test
```

只有检查和测试通过后再上传。`node:sqlite` 的 experimental warning 属于 Node 运行时提示，不是测试失败。

## 2. 打包并上传代码

在项目根目录执行。压缩包放在项目目录外，避免被再次打包：

```powershell
$releaseArchive = "E:\ZXL\Html_Project\task-atlas-update.tar.gz"
tar -czf $releaseArchive --exclude=.git --exclude=.codex --exclude=node_modules --exclude=data .

scp -i "C:\Users\Administrator\Documents\cloudserver.pem" `
  $releaseArchive `
  root@1.14.190.127:/tmp/task-atlas-update.tar.gz
```

## 3. 备份并更新服务器

先备份数据库，再停止服务、覆盖代码、安装生产依赖并启动服务：

```powershell
ssh -i "C:\Users\Administrator\Documents\cloudserver.pem" root@1.14.190.127 'set -e
backup_dir=/home/taskatlas/backups
install -d -o taskatlas -g taskatlas -m 0700 $backup_dir
systemctl stop task-atlas
backup_file=$backup_dir/task-atlas-before-update-$(date +%Y%m%d-%H%M%S).sqlite
cp -p /home/taskatlas/task-atlas/data/task-atlas.sqlite $backup_file
tar -xzf /tmp/task-atlas-update.tar.gz -C /home/taskatlas/task-atlas
rm -f /tmp/task-atlas-update.tar.gz
chown -R taskatlas:taskatlas /home/taskatlas/task-atlas
find /home/taskatlas/task-atlas -type d -exec chmod 0755 {} +
find /home/taskatlas/task-atlas -type f -exec chmod 0644 {} +
chmod 0750 /home/taskatlas/task-atlas/data
chmod 0600 /home/taskatlas/task-atlas/data/task-atlas.sqlite
cd /home/taskatlas/task-atlas
sudo -u taskatlas npm ci --omit=dev
systemctl daemon-reload
systemctl start task-atlas
sleep 3
systemctl is-active --quiet task-atlas
curl -fsS http://127.0.0.1:55377/api/health
'
```

这会保留云端数据库，只更新应用代码和 `node_modules`。如果修改了 systemd 配置，`daemon-reload` 会加载新配置。

## 4. 更新后的检查

```powershell
ssh -i "C:\Users\Administrator\Documents\cloudserver.pem" root@1.14.190.127 'systemctl status task-atlas --no-pager; journalctl -u task-atlas -n 50 --no-pager; curl -fsS http://127.0.0.1:55377/api/health'
```

然后浏览器访问：`http://1.14.190.127:55377`。

如果只想确认端口是否监听：

```powershell
ssh -i "C:\Users\Administrator\Documents\cloudserver.pem" root@1.14.190.127 'ss -ltnp | grep :55377'
```

## 5. 创建服务器账号

公网注册已关闭。创建新应用账号时，在服务器上执行：

```bash
cd /home/taskatlas/task-atlas
export TASK_ATLAS_ADMIN_PASSWORD='替换为至少 8 位的独立密码'
npm run user:create -- new_username
unset TASK_ATLAS_ADMIN_PASSWORD
```

用户名只能使用 3-24 位小写字母、数字、下划线和连字符。

## 6. 数据导入与替换

- 代码更新：使用本文第 2、3 节，**不要上传数据库**。
- 单个项目备份或迁移：在网页中使用“导出 JSON”和“导入 JSON”。导入会追加项目，不会自动删除现有项目。
- 要用一个工作区 JSON 完全替换某个账号的数据，必须先备份数据库，再执行删除和导入；这不是普通代码更新步骤，建议在确认导入文件有效后再操作。

JSON 中如果包含远控地址、账号或密码，不要在未启用 HTTPS 的公网服务中长期保存或使用。

## 7. 回滚数据库

如果数据迁移失败，可用备份恢复。将下面的文件名替换为实际备份文件：

```powershell
ssh -i "C:\Users\Administrator\Documents\cloudserver.pem" root@1.14.190.127 'set -e
systemctl stop task-atlas
cp -p /home/taskatlas/backups/task-atlas-before-update-YYYYMMDD-HHMMSS.sqlite /home/taskatlas/task-atlas/data/task-atlas.sqlite
chown taskatlas:taskatlas /home/taskatlas/task-atlas/data/task-atlas.sqlite
chmod 0600 /home/taskatlas/task-atlas/data/task-atlas.sqlite
systemctl start task-atlas
'
```

数据库回滚不会回滚代码。代码回滚需要重新上传之前保存的代码压缩包，然后按第 3 节执行。

## 8. 常用运维命令

```bash
systemctl restart task-atlas
systemctl stop task-atlas
systemctl start task-atlas
journalctl -u task-atlas -f
```

云厂商安全组还必须允许入站 TCP `55377`。当前服务是 HTTP 直连，正式使用建议绑定域名并配置 HTTPS。
