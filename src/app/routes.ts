import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { FieldUserDashboard } from "./pages/FieldUserDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminHome } from "./pages/admin/AdminHome";
import { AdminMap } from "./pages/admin/AdminMap";
import { AdminDatabase } from "./pages/admin/AdminDatabase";
import { AdminProfile } from "./pages/admin/AdminProfile";
import { TreePublicView } from "./pages/TreePublicView";
import ReportGenerator from './pages/admin/reports/ReportGenerator';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/view/:treeId",
    Component: TreePublicView,
  },
  {
    path: "/field-user",
    Component: FieldUserDashboard,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
    children: [
      {
        index: true,
        Component: AdminHome,
      },
      {
        path: "map",
        Component: AdminMap,
      },
      {
        path: "database",
        Component: AdminDatabase,
      },
      {
        path: "profile",
        Component: AdminProfile,
      },
      { // Add the new route for the reports module
        path: "reports",
        Component: ReportGenerator,
      },
    ],
  },
]);
