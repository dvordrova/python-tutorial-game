import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { ErrorPage } from "./pages/error";

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
