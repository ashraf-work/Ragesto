import Header from "../components/Header"

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">{children}</main>
    </div>
  );
};

export default Layout;
