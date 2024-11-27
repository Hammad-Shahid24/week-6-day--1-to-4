import { FC } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import ProductCataloguePage from "./pages/ProductCataloguePage";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: FC = () => {
  return (
    <ErrorBoundary>
      <Layout>
        <Header />
        <ProductCataloguePage />
        <ToastContainer />
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
