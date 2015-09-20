<!doctype Html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>@yield('title', 'instaplace.me - Instagram online viewer')</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width">
    @yield('meta')
    <!-- stylesheets -->
    @yield('styles')
    {!! Html::style('assets/css/style.css') !!}
    {!! Html::style('assets/css/toolkit.css') !!}
    {!! Html::style('assets/emoji/emoji.css') !!}
    <script type="text/javascript">
        var rootUrl = '{!! json_encode(url('/')) !!}';
        if (typeof (console) == "undefined")
            console = { log: function (content) { } };
        if (typeof (MultiViewLang) == "undefined")
            MultiViewLang = {};
        var userPageBaseUrl = '';
        var searchTagBaseUrl = '';
        var searchUserBaseUrl = '';
    </script>
  </head>
  <body class="with-top-navbar">
    @section('navbar')
    @include('layouts.partials.navbar')
    @show
    @section('main')
    <div class="wallToolbar" style="text-align: center; ">
      <div class="btn-group photoSizeSwitch" data-toggle="buttons">
        <label class="btn btn-sm btn-default brickClassBtn-S btnMayHideText">
          <input type="radio" name="options"><i class="glyphicon glyphicon-th"></i><span class="btnText">S</span>
        </label>
        <label class="btn btn-sm btn-default brickClassBtn-M active btnMayHideText">
          <input type="radio" name="options" checked><i class="glyphicon glyphicon-th-large"></i><span class="btnText">M</span>
        </label>
        <label class="btn btn-sm btn-default brickClassBtn-L btnMayHideText">
          <input type="radio" name="options"><i class="glyphicon glyphicon-stop"></i><span class="btnText">L</span>
        </label>
      </div>
      <div class="btn-group viewModeSwitch" data-toggle="buttons">
        <label class="btn btn-sm btn-default viewModeBtn-bricks active">
          <input type="radio" name="options"><i class="glyphicon glyphicon-list-alt"></i>Full
        </label>
        <label class="btn btn-sm btn-default viewModeBtn-tight">
          <input type="radio" name="options" checked>Compact
        </label>
      </div>
      <button type="button" class="btn btn-sm btn-default btn-small" onclick="($(window).scrollTop(0)+(window.location = window.location.pathname))" title="Refresh"><i class="glyphicon glyphicon-refresh" style="margin-right:0;"></i></button>
    </div>
      @yield('content')
      @show
      @section('footer')
      @include('layouts.partials.footer')
      @show
      <!-- scripts -->
      {!! Html::script('//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js') !!}
      @yield('scripts')
      {!! Html::script('assets/js/application.js') !!}
      {!! Html::script('//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js') !!}
      {!! Html::script('assets/js/toolkit.js') !!}
      {!! Html::script('assets/emoji/emoji.js') !!}


    </body>
  </html>
