import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Timeline from "./Pages/TimeLine";
import VideoCall from "./Pages/VideoCall";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/videocall" element={<VideoCall />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
