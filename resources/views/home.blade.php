@extends('layouts.master')
@section('title', 'Page Title')
@endsection
@section('content')


<div class="container-fluid brickClass-M wallContainer">
    <div class="row wall">
        @foreach((array) $popular['data'] as $k => $r)
        <div class="brick col-xs-12 col-sm-6 col-md-4 col-lg-3" id="brick-{{ $r['id'] }}" mediaid="{{ $r['id'] }}" actioninit="false">
            <div class="brickBody">
                <div class="user">
                    <div class="profileImage">
                        <a href="{{$r['user']['username']}}" title="{{$r['user']['full_name']}}">
                            <img src="{{$r['user']['profile_picture']}}" />
                        </a>
                    </div>
                    <div class="userName">
                        <a href="{{$r['user']['username']}}" title="{{$r['user']['full_name']}}">{{$r['user']['username']}} </a>
                    </div>
                </div>
                <div class="pic">
                    <div class="brickActions">
                        <div class="btn-group actionBtns">
                            <button onmousedown="like('{{ $r['id'] }}')" type="button" class="btn btn-default brickLike" title="Like"><i class="glyphicon glyphicon-heart" style="margin-right:0;"></i></button>
                            <button onmousedown="favMedia('{{ $r['id'] }}')" type="button" class="btn btn-default brickFav" title="Add to favorites"><i class="glyphicon glyphicon-star" style="margin-right:0;"></i></button>
                            <button onmousedown="showShareModal(this)" type="button" class="btn btn-default" title="Share"><i class="glyphicon glyphicon-share-alt" style="margin-right:0;"></i></button>
                            <button onmousedown="comment('{{ $r['id'] }}')" type="button" class="btn btn-default" title="Comment"><i class="glyphicon glyphicon-comment" style="margin-right:0;"></i></button>
                        </div>
                    </div>
                    <a href="javascript:void(0)" class="pic-a picLink">
                        <img class="image" src="{{ $r['images']['standard_resolution']['url'] }}" srcx="{{ $r['images']['standard_resolution']['url'] }}" alt="">
                    </a>
                </div>
                <div class="caption emojstext">
                    {{ $r['caption']['text'] }}
                </div>
                <div class="stats">
                    <span class="likesCount">{{ $r['likes']['count'] }}</span>
                    <span class="commentsCount">{{ $r['comments']['count'] }}</span>
                    <span class="createTime">{{ Carbon::createFromTimeStampUTC($r['created_time'])->diffForHumans()  }}</span>
                </div>
                <div class="comments">
                </div>
            </div>
        </div>
        @endforeach
    </div>
</div>
<script type="text/javascript">
    var mediaJson = '{{ json_encode($popular['data']) }}';
    var mediaPagination = null;
    var maxIDField = 'next_max_id';
    var appendAction = 'GetGlobalPopulars';
    var nextMaxID = null;
    if (mediaPagination && maxIDField) {
        nextMaxID = mediaPagination[maxIDField];
    }
    var appendExtensionParam = null;
    var alreadyFavsArray = null;
    var enableIGProxy = false;
    var enableMediaFileCache = false;
    mediaCacheRootDomain = 'pinsta.me';
</script>

@endsection
