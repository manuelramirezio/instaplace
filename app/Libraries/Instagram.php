<?php
namespace App\Libraries;
use ArrayAccess;
use ArrayIterator;
use Countable;
use Exception;
use IteratorAggregate;

class Instagram {
	protected $clientId, $clientSecret, $accessToken;
	protected $accessTokenUrl = 'https://api.instagram.com/oauth/access_token';
	protected $authorizeUrl = 'https://api.instagram.com/oauth/authorize';
	protected $apiUrl = 'https://api.instagram.com';
	protected $userAgent = 'Instagram PHP';
	protected $apiVersion = 'v1';
	protected $isAsynchronous = false;
	protected $followLocation = false;
	protected $connectionTimeout = 5;
	protected $requestTimeout = 30;
	protected $debug = true;

	public function __construct($params) {
		$this->clientId = $params['clientId'];
		$this->clientSecret = $params['clientSecret'];
		$this->setAccessToken($params['accessToken']);
	}

	/**
	 * Getting user's access token after authorization
	 *
	 * @param string $code Content of «code» GET parameter
	 * @param string $redirectUri
	 * @return InstagramJson
	 */
	public function getAccessToken($code, $redirectUri) {
		$params = array(
			'client_id' => $this->clientId,
			'client_secret' => $this->clientSecret,
			'grant_type' => 'authorization_code',
			'redirect_uri' => $redirectUri,
			'code' => $code,
		);

		return $this->request('POST', $this->accessTokenUrl, $params);
	}

	/**
	 * Getting url for user's authorization
	 *
	 * @link http://instagram.com/developer/auth/#scope
	 * @param string $redirectUri
	 * @param array $scope Permissions
	 * @return string
	 */
	public function getAuthorizeUrl($redirectUri, $scope = array()) {
		if ($scope && count($scope)) {
			$scope = array('scope' => implode(' ', $scope));
		} else {
			$scope = array();
		}

		$params = array_merge(array('client_id' => $this->clientId, 'response_type' => 'code', 'redirect_uri' => $redirectUri), $scope);

		$qs = http_build_query($params);
		return "{$this->authorizeUrl}?{$qs}";
	}

	public function setAccessToken($accessToken) {
		if (!empty($accessToken)) {
			$this->accessToken = $accessToken;
		}

	}

	public function setTimeout($requestTimeout = null, $connectionTimeout = null) {
		if ($requestTimeout !== null) {
			$this->requestTimeout = floatval($requestTimeout);
		}

		if ($connectionTimeout !== null) {
			$this->connectionTimeout = floatval($connectionTimeout);
		}

	}

	public function setUserAgent($agent) {
		$this->userAgent = $agent;
	}

	public function useApiVersion($version = null) {
		$this->apiVersion = $version;
	}

	public function useAsynchronous($async = true) {
		$this->isAsynchronous = (bool) $async;
	}

	// Public api interface for most calls GET/POST/DELETE
	public function delete($endpoint, $params = null) {
		return $this->request('DELETE', $endpoint, $params);
	}

	public function get($endpoint, $params = null) {
		return $this->request('GET', $endpoint, $params);
	}

	public function post($endpoint, $params = null) {
		return $this->request('POST', $endpoint, $params);
	}

	private function getApiUrl($endpoint) {
		if (!empty($this->apiVersion)) {
			return "{$this->apiUrl}/{$this->apiVersion}{$endpoint}";
		} else {
			return "{$this->apiUrl}{$endpoint}";
		}

	}

	private function request($method, $endpoint, $params = null) {
		if (preg_match('#^https?://#', $endpoint)) {
			$url = $endpoint;
		} else {
			$url = $this->getApiUrl($endpoint);
		}

		if ($this->accessToken) {
			$params['access_token'] = $this->accessToken;
		}

		$params['client_id'] = $this->clientId;
		$params['client_secret'] = $this->clientSecret;

		if ($method === 'GET' || $method === 'DELETE') {
			$url .= is_null($params) ? '' : '?' . http_build_query($params, '', '&');
		}

		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_USERAGENT, $this->userAgent);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, $this->requestTimeout);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip');

		if (isset($_SERVER['SERVER_ADDR']) && !empty($_SERVER['SERVER_ADDR']) && $_SERVER['SERVER_ADDR'] != '127.0.0.1') {
			curl_setopt($ch, CURLOPT_INTERFACE, $_SERVER['SERVER_ADDR']);
		}

		if ($method === 'POST' && $params !== null) {
			curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
		}

		$resp = new InstagramJson(EpiCurl::getInstance()->addCurl($ch), $this->debug);
		if (!$this->isAsynchronous) {
			$resp->responseText;
		}

		return $resp;
	}
}

class InstagramJson implements ArrayAccess, Countable, IteratorAggregate {
	private $debug;
	private $__resp;
	public function __construct($response, $debug = false) {
		$this->__resp = $response;
		$this->debug = $debug;
	}

	// ensure that calls complete by blocking for results, NOOP if already returned
	public function __destruct() {
		$this->responseText;
	}

	// Implementation of the IteratorAggregate::getIterator() to support foreach ($this as $...)
	public function getIterator() {
		if ($this->__obj) {
			return new ArrayIterator($this->__obj);
		} else {
			return new ArrayIterator($this->response);
		}
	}

	// Implementation of Countable::count() to support count($this)
	public function count() {
		return count($this->response);
	}

	// Next four functions are to support ArrayAccess interface
	// 1
	public function offsetSet($offset, $value) {
		$this->response[$offset] = $value;
	}

	// 2
	public function offsetExists($offset) {
		return isset($this->response[$offset]);
	}

	// 3
	public function offsetUnset($offset) {
		unset($this->response[$offset]);
	}

	// 4
	public function offsetGet($offset) {
		return isset($this->response[$offset]) ? $this->response[$offset] : null;
	}

	public function __get($name) {
		$accessible = array('responseText' => 1, 'headers' => 1, 'code' => 1);
		$this->responseText = $this->__resp->data;
		$this->headers = $this->__resp->headers;
		$this->code = $this->__resp->code;
		if (isset($accessible[$name]) && $accessible[$name]) {
			return $this->$name;
		} elseif (($this->code < 200 || $this->code >= 400) && !isset($accessible[$name])) {
			InstagramException::raise($this->__resp, $this->debug);
		}

		// Call appears ok so we can fill in the response
		$this->response = json_decode($this->responseText, 1);
		$this->response = $this->response;
		$this->__obj = json_decode($this->responseText);
		$this->__obj = $this->__obj;

		if (gettype($this->__obj) === 'object') {
			foreach ($this->__obj as $k => $v) {
				$this->$k = $v;
			}
		}

		if (property_exists($this, $name)) {
			return $this->$name;
		}
		return null;
	}

	public function __isset($name) {

		return !empty($name);
	}
}

class InstagramException extends Exception {
	public static function raise($response, $debug) {
		$error = json_decode($response->data, true);
		if (isset($error['meta'])) {
			$message = $error['meta']['error_message'];
			$code = $error['meta']['code'];
		} elseif (isset($error['error_message'])) {
			$message = $error['error_message'];
			$code = $error['code'];
		} elseif (is_string($response->data)) {
			$code = $response->code;
			$message = $response->data;
		} else {
			$code = $response->code;
			$message = 'Unknown error';
		}

		switch ($code) {
		default:
			throw new InstagramException($message, $code);
		}
	}
}
class InstagramBadRequestException extends InstagramException {}
class InstagramNotAuthorizedException extends InstagramException {}
class InstagramForbiddenException extends InstagramException {}
class InstagramNotFoundException extends InstagramException {}

class EpiCurl {
	const Timeout = 3;
	static $inst = null;
	static $singleton = 0;
	private $mc;
	private $running;
	private $execStatus;
	private $sleepIncrement = 1.1;
	private $responses = array();
	private $properties = array();
	function __construct() {
		if (self::$singleton == 0) {
			throw new Exception('This class cannot be instantiated by the new keyword.  You must instantiate it using: $obj = EpiCurl::getInstance();');
		}
		$this->mc = curl_multi_init();
		$this->properties = array(
			'code' => CURLINFO_HTTP_CODE,
			'time' => CURLINFO_TOTAL_TIME,
			'length' => CURLINFO_CONTENT_LENGTH_DOWNLOAD,
			'type' => CURLINFO_CONTENT_TYPE,
			'url' => CURLINFO_EFFECTIVE_URL,
		);
	}

	// simplifies example and allows for additional curl options to be passed in via array
	public function addURL($url, $options = array()) {
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		foreach ($options as $option => $value) {
			curl_setopt($ch, $option, $value);
		}
		return $this->addCurl($ch);
	}
	public function addCurl($ch) {
		$key = $this->getKey($ch);
		$this->requests[$key] = $ch;
		curl_setopt($ch, CURLOPT_HEADERFUNCTION, array($this, 'headerCallback'));
		$code = curl_multi_add_handle($this->mc, $ch);

		// (1)
		if ($code === CURLM_OK || $code === CURLM_CALL_MULTI_PERFORM) {
			do {
				$code = $this->execStatus = curl_multi_exec($this->mc, $this->running);
			} while ($this->execStatus === CURLM_CALL_MULTI_PERFORM);
			return new EpiCurlManager($key);
		} else {
			return $code;
		}
	}
	public function getResult($key = null) {
		if ($key !== null) {
			if (isset($this->responses[$key]['data'])) {
				return $this->responses[$key];
			}
			$innerSleepInt = $outerSleepInt = 1;
			while ($this->running && ($this->execStatus == CURLM_OK || $this->execStatus == CURLM_CALL_MULTI_PERFORM)) {
				usleep($outerSleepInt);
				$outerSleepInt *= $this->sleepIncrement;
				$ms = curl_multi_select($this->mc);
				if ($ms >= CURLM_CALL_MULTI_PERFORM) {
					do {
						$this->execStatus = curl_multi_exec($this->mc, $this->running);
						usleep($innerSleepInt);
						$innerSleepInt *= $this->sleepIncrement;
					} while ($this->execStatus == CURLM_CALL_MULTI_PERFORM);
					$innerSleepInt = 1;
				}
				$this->storeResponses();
				if (isset($this->responses[$key]['data'])) {
					return $this->responses[$key];
				}
			}
			return null;
		}
		return false;
	}

	public function cleanupResponses() {
		$this->responses = array();
	}
	private function getKey($ch) {
		return (string) $ch;
	}
	private function headerCallback($ch, $header) {
		$_header = trim($header);
		$colonPos = strpos($_header, ':');
		if ($colonPos > 0) {
			$key = substr($_header, 0, $colonPos);
			$val = preg_replace('/^\W+/', '', substr($_header, $colonPos));
			$this->responses[$this->getKey($ch)]['headers'][$key] = $val;
		}
		return strlen($header);
	}
	private function storeResponses() {
		while ($done = curl_multi_info_read($this->mc)) {
			$key = (string) $done['handle'];
			$this->responses[$key]['data'] = curl_multi_getcontent($done['handle']);
			foreach ($this->properties as $name => $const) {
				$this->responses[$key][$name] = curl_getinfo($done['handle'], $const);
			}
			curl_multi_remove_handle($this->mc, $done['handle']);
			curl_close($done['handle']);
		}
	}
	static function getInstance() {
		if (self::$inst === null) {
			self::$singleton = 1;
			self::$inst = new EpiCurl();
		}
		return self::$inst;
	}
}
class EpiCurlManager {
	private $key;
	private $epiCurl;
	function __construct($key) {
		$this->key = $key;
		$this->epiCurl = EpiCurl::getInstance();
	}
	function __get($name) {
		$responses = $this->epiCurl->getResult($this->key);
		return $responses[$name];
	}
	function __isset($name) {
		$val = self::__get($name);
		return empty($val);
	}
}
