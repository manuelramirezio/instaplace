@extends('layouts.master')
@section('title', 'Page Title')
@endsection
@section('content')
<div class="container-fluid brickClass-M wallContainer">
    <div class="profileBannerWrapper">
        <div class="row brickBody">
            <script type="text/javascript">
            var pageInfoIGID = '{{ $user['data']['username'] }}';
            var pageIGUser = '{{ json_encode($user['data']) }}';
            </script>
            <script type="text/javascript">
            following = false;
            followedMe = false;
            var followRequested  = false;
            </script>
            <div class="col">
                <div class="profile-picture">
                    <img src="{{ $user['data']['profile_picture'] }}" alt="" style="margin:auto" />
                </div>
                <div class="profile-username">
                    <span class="usernameAt">@</span><span>{{ $user['data']['username'] }}</span>
                    <a class="followBtn btn btn-primary btn-sm profileFollowBtn" href="javascript:followUser('{{ $user['data']['id'] }}')" rel="nofollow">
                        Follow
                    </a>
                </div>
                <div class="emojstext profile-info">
                    <div class="profile-info-table">
                        <div class="profile-info-table-cell">
                            <span class="profileUserFullName">{{ $user['data']['full_name'] }}</span>
                            <span class="profile-bio">{{ $user['data']['bio'] }}</span>
                            <a href="{{ $user['data']['website'] }}" class="selectable profileWebsite" title="">{{ $user['data']['website'] }}</a>
                        </div>
                    </div>
                </div>
                <div class="profileUserStats">
                    <div class="stat">
                        <div class="statNumber decoration">{{ $user['data']['counts']['media'] }}</div>
                        <div class="statName">Posts</div>
                    </div>
                    <div class="stat clickable" onmousedown="showUserRelationModal('{{ $user['data']['id'] }}', 'follower')">
                        <div class="statNumber decoration">{{ $user['data']['counts']['followed_by'] }}</div>
                        <div class="statName">Follower</div>
                    </div>
                    <div class="stat clickable" style="margin: 0;" onmousedown="showUserRelationModal('{{ $user['data']['id'] }}', 'following')">
                        <div class="statNumber decoration">{{ $user['data']['counts']['follows'] }}</div>
                        <div class="statName" style="font-size:12px; padding: 1px 0;">Following</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row wall">
        @foreach((array) $photos['data'] as $k => $r)
<div class="brick col-xs-12 col-sm-6 col-md-4 col-lg-3" id="brick-{{ $r['id'] }}" mediaid="{{ $r['id'] }}" actioninit="false">
    <div class="brickBody">
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
                <img class="image" src="{{ $r['images']['standard_resolution']['url'] }}" srcx="{{ $r['images']['low_resolution']['url'] }}" alt="">
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
            <div class="comment clearfix">
                <div class="commentBody">
                    <div class="commentProfileImage">
                        <a href="{{ $r['comments']['data'][0]['from']['username']  }}" title="{{ $r['comments']['data'][0]['from']['full_name'] }}" target="_blank">
                            <img src="{{ $r['comments']['data'][0]['from']['profile_picture'] }}" />
                        </a>
                    </div>
                    <a href="{{ $r['comments']['data'][0]['from']['username'] }}" title="{{ $r['comments']['data'][0]['from']['full_name'] }}" target="_blank">{{ $r['comments']['data'][0]['from']['username'] }} </a>
                    <div class="detailCommentText emojstext">{{ $r['comments']['data'][0]['text'] }}</div>
                </div>
            </div>
            <div class="comment clearfix">
                <div class="commentBody">
                    <div class="commentProfileImage">
                        <a href="{{ $r['comments']['data'][1]['from']['username'] }}" title="{{ $r['comments']['data'][1]['from']['full_name'] }}" target="_blank">
                            <img src="{{ $r['comments']['data'][1]['from']['profile_picture'] }}" />
                        </a>
                    </div>
                    <a href="{{ $r['comments']['data'][1]['from']['username'] }}" title="{{ $r['comments']['data'][1]['from']['full_name'] }}" target="_blank">{{ $r['comments']['data'][1]['from']['username'] }} </a>
                    <div class="detailCommentText emojstext">{{ $r['comments']['data'][1]['text'] }}</div>
                </div>
            </div>
        </div>
    </div>
</div>
@endforeach
    </div>
</div>
<script type="text/javascript">
    var mediaJson = '{{ json_encode($photos['data']) }}';
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
