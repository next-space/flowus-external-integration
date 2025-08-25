import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { DefaultApi, Configuration } from "flowus-api-sdk";

// Vite server is running on port 3000, so redirect URI should match
//已授权的页面id
const PAGE_ID = import.meta.env.VITE_PAGE_ID;
//只是demo，这个不应该写在前端，应该请求后端接口，再由后端获取token返回
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

// 完整的授权URL
const authorizationUrl = import.meta.env.VITE_AUTHORIZATION_URL;
//重定向页面
const REDIRECT_URI = new URL(authorizationUrl).searchParams.get("redirect_uri");
//外部应用id
const CLIENT_ID = new URL(authorizationUrl).searchParams.get("client_id");

function App() {
  const [token, setToken] = useState<string | null>("");
  const [title, setTitle] = useState<any>(null);
  const [pageContent, setPageContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadPage = async () => {
      const apiClient = new DefaultApi(
        new Configuration({
          accessToken: token,
          basePath: "http://localhost:3000",
        })
      );
      console.log("xx:", PAGE_ID);
      const children = await apiClient.getBlockChildren({
        blockId: PAGE_ID,
      });
      const block = await apiClient.getBlock({
        blockId: PAGE_ID,
      });
      const title = block.data?.title;
      setTitle(title);

      const content = children.results
        ?.map((v) => v.data?.rich_text?.map((a) => a.text?.content).join(""))
        .join("\n");
      console.log("content", content);
      setPageContent(content);
    };
    void loadPage();
  }, [token]);

  useEffect(() => {
    const fetchTokenAndData = async () => {
      console.log("window.location:", window.location.href);
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      // If we have a code and no token, fetch the token
      if (code && !token) {
        try {
          console.log("Found authorization code:", code);
          // Step 1: Exchange code for token
          const tokenResponse = await axios.post("/oauth/token", {
            client_id: CLIENT_ID,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: REDIRECT_URI,
            client_secret: CLIENT_SECRET,
          });

          const accessToken = tokenResponse.data.data.access_token;
          if (!accessToken) {
            throw new Error("Access token not found in response");
          }
          setToken(accessToken);
        } catch (err: any) {
          console.error("Error during fetch process:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "An unknown error occurred.";
          setError(errorMessage);
        } finally {
          // Clean the URL to remove the code, preventing re-fetching on refresh
          // window.history.replaceState(
          //   {},
          //   document.title,
          //   window.location.pathname
          // );
        }
      }
      setLoading(false);
    };

    fetchTokenAndData();
  }, []); // Run only once on component mount

  const handleLogin = () => {
    window.location.href = authorizationUrl;
  };

  // Show a loading indicator while we are fetching the token
  if (loading && new URLSearchParams(window.location.search).has("code")) {
    return (
      <div className="container">
        <h1>Loading...</h1>
        <p>正在获取 Token 和页面内容，请稍候。</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <div
        className="container"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <h1>FlowUs API Demo</h1>
        {!token ? (
          <div className="auth-section">
            <p>请点击下方按钮进行授权。</p>
            <button
              onClick={handleLogin}
              style={{
                color: "white",
              }}
            >
              使用 FlowUs 授权
            </button>
          </div>
        ) : (
          <div>
            <h2>授权成功！</h2>
            <div className="token-display">
              <strong>Access Token:</strong>
              <pre>{token}</pre>
            </div>

            <hr />
            {title && <h2>页面标题:{title}</h2>}

            <h2>页面内容 (ID: {PAGE_ID})</h2>
            {pageContent ? (
              <div
                style={{
                  whiteSpace: "break-spaces",
                }}
              >
                {pageContent}
              </div>
            ) : (
              <p>正在加载页面内容...</p>
            )}
          </div>
        )}
        {error && (
          <div className="error-display">
            <h2>发生错误</h2>
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
