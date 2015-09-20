<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
 */
// Get Popular images
Route::get('/', array('as' => 'home', 'uses' => 'HomeController@index'));

// Get Popular images
Route::get('popular', array('as' => 'popular', 'uses' => 'HomeController@popular'));

// Get user media
Route::get('{user}', array('as' => 'user', 'uses' => 'HomeController@user'));
