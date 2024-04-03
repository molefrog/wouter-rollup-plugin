import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Routes from "wouter:routes";

const Main = () => {
  return (
    <Router hook={useHashLocation}>
      <h1>App</h1>
      <Routes />
    </Router>
  );
};

console.log(<Main />);
