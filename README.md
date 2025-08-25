## 这是一个外部应用授权页面后读取页面内容的一个简单 demo

```bash
npm install
cp .env-template .env
#修改好.env配置后执行
npm run dev
```

- .env 目录下配置 VITE_CLIENT_SECRET,VITE_PAGE_ID,VITE_AUTHORIZATION_URL
- VITE_PAGE_ID 需要授权，否则会没有权限读取
- 外部应用设置重定向地址必须要增加 http://localhost:3000/callback
