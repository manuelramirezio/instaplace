<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Libraries\Instagram;
use Illuminate\Http\Request;
use Session;

class HomeController extends Controller {
	protected $instagram;

	//Initial configuration
	public $client_id = '9095629b5b624f32bd5640d3aae07c34';
	public $client_secret = '79e717d1b1e24af79874f3591caa25da';
	public $redirectUri = 'http://instaplace.me/';

	//variable to store user information
	public $userInfo = FALSE;

	public function __construct() {
		$params = array(
			'clientId' => $this->client_id,
			'clientSecret' => $this->client_secret,
			'accessToken' => NULL,
		);
		$this->instagram = new Instagram($params);

		//perform login, if user alredy logged in, will return FALSE
		$this->_authorize();

		//assign useringormation as array from session
		$this->userInfo = unserialize(Session::put('userInfo'));

	}

	private function _authorize() {
		//Return false if user logged in
		if (Session::has('access_token')):
			$this->instagram->setAccessToken(Session::put('userInfo'));
			return FALSE;
		endif;

		//If instagram.com returned code
		if (isset($_GET['code'])):
			$token = $this->instagram->getAccessToken($_GET['code'], $this->redirectUri);
			$this->userInfo = $token->user; //basic information about user

			$sessionData = array(
				'userInfo' => serialize($token->user),
				'access_token' => $token->access_token,
			);

			$this->session->set_userdata($sessionData);

			//Record user token
			$this->main_model->addUserToken($token->user->id, $token->user->username, $token->access_token);

			//redirect to initial page
			header('Location: ' . $this->redirectUri);
		else:
			//Set scope of access and set URL for authorization
			$url = $this->instagram->getAuthorizeUrl($this->redirectUri, array('basic', 'likes', 'comments', 'relationships'));

			//Display authorization page
			return view('home');
		endif;

		die;
	}

	/**
	 * Returns user id by login
	 *
	 * @param string $username
	 */
	private function _getUserId($username) {
		//Get user's id
		$userId = $this->instagram->get('/users/search/', array('q' => $username));

		//if user doesn't exist
		if (!isset($userId->data[0]->id)) {
			return FALSE;
		}

		return $userId->data[0]->id;
	}

	public function index() {
		$popular = $this->instagram->get('/media/popular/');

		return view('home', compact('popular'));
	}

	/**
	 * Get popular photos
	 */
	public function popular() {
		$popular = $this->instagram->get('/media/popular/');

		//if no data fetched
		if ($popular->code !== 200) {
			'error';
		}

		return view('home', compact('popular'));
	}

	/**
	 * Show user information with all photos
	 *
	 * @param string $name
	 */
	public function user($name = FALSE, $id = FALSE) {
		//if username doesn't exist, show profile of authorized user
		if ($name):
			$userId = $this->_getUserId($name);
			$media = $this->instagram->get("/media/shortcode/shortcode");

			$user = $this->instagram->get("/users/{$userId}/");
			$photos = $this->instagram->get("/users/{$userId}/media/recent/");

		else:
			$user = $this->instagram->get('/users/self/');
			$photos = $this->instagram->get('/users/self/media/recent/');

		endif;

		//if no data fetched
		if ($photos->code !== 200) {
			echo "string";
		}

		return view('user', compact('media', 'user', 'photos'));
	}

	/**
	 * Display current relationship between users
	 */
	public function _relationship($userId = FALSE) {
		if (!$userId) {
			return FALSE;
		}

		$data = $this->instagram->get("/users/{$userId}/relationship");
		return $data['data'];
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(Request $request) {
		//
	}

}
