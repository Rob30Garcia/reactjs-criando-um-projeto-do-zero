import { useEffect } from "react";

export default function Comment() {
  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.async = true;
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("repo", "Rob30Garcia/reactjs-criando-um-projeto-do-zero");
    script.setAttribute("issue-term", "parthname");
    script.setAttribute("label", "comment");
    script.setAttribute("theme", "github-dark");
    anchor.appendChild(script);
  }, [])

  return (
    <div id="inject-comments-for-uterances"></div>
  );
}
