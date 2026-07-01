"use client";

import { createBrowserRouter, Navigate } from "react-router-dom";
import { LandingPage } from "@/views/LandingPage";
import { LoginPage } from "@/views/LoginPage";
import { RegisterPage } from "@/views/RegisterPage";
import { NotFoundPage } from "@/views/NotFoundPage";
import { StudentDashboardPage } from "@/views/student/StudentDashboardPage";
import { StudentAvatarPage } from "@/views/student/StudentAvatarPage";
import { TeacherDashboardPage } from "@/views/teacher/TeacherDashboardPage";
import { TeacherStorePage } from "@/views/teacher/TeacherStorePage";
import { TeacherJobsPage } from "@/views/teacher/TeacherJobsPage";
import { TeacherClassDisplayPage } from "@/views/teacher/TeacherClassDisplayPage";
import { ParentDashboardPage } from "@/views/parent/ParentDashboardPage";
import { StudentLayout } from "@/router/layouts/StudentLayout";
import { TeacherLayout } from "@/router/layouts/TeacherLayout";

/** Client-only — must not run during Next.js SSR (createBrowserRouter touches document). */
export function createAppRouter() {
  return createBrowserRouter([
    { path: "/", element: <LandingPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    {
      path: "/student",
      element: <StudentLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <StudentDashboardPage /> },
        { path: "avatar", element: <StudentAvatarPage /> },
      ],
    },
    {
      path: "/teacher",
      element: <TeacherLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <TeacherDashboardPage /> },
        { path: "display", element: <TeacherClassDisplayPage /> },
        { path: "store", element: <TeacherStorePage /> },
        { path: "jobs", element: <TeacherJobsPage /> },
      ],
    },
    { path: "/parent/dashboard", element: <ParentDashboardPage /> },
    { path: "*", element: <NotFoundPage /> },
  ]);
}
