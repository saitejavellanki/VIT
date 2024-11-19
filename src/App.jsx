import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";
import PostUpload from "./pages/post_upload";
import PostsFeed from "./pages/postfeeds";
import FeedPage from "./pages/postfeeds";
import Navbar from "./pages/Navbar";


function App() {
	const [authUser] = useAuthState(auth);

	return (
		<>
			<Navbar/>
			<Routes>
				{/* <Route path='/home' element={authUser ? <HomePage /> : <Navigate to='/auth' />} /> */}
				<Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to='/' />} />
				{/* <Route path='/:username' element={<ProfilePage />} /> */}
				<Route path='/upload' element={<PostUpload />} />
				<Route path='/' element={<FeedPage/>} />
			</Routes>
		</>
	);
}

export default App;
