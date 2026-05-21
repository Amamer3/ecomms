import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useRouterState } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./router-DPkHdSCT.mjs";
import { s as selectPathname } from "./router-pathname-B_nSBnfm.mjs";
function LoadingSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-pulse", "aria-busy": "true", "aria-label": "Loading", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 rounded-3xl bg-muted/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 rounded-3xl bg-muted/40" })
  ] });
}
function RequireCustomer({ children }) {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: selectPathname });
  reactExports.useEffect(() => {
    if (!ready) return;
    if (!session || session.role !== "customer") {
      navigate({ to: "/login", search: { redirect: pathname } });
    }
  }, [ready, session, navigate, pathname]);
  if (!ready) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {});
  if (!session || session.role !== "customer") return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
export {
  RequireCustomer as R
};
