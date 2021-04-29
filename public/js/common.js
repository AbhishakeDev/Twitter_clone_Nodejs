// $('#postTextArea').keyup((e) => {
//   var textbox = $(e.target);
//   console.log(textbox);
// });

document.getElementById('postTextArea').addEventListener('keyup', (e) => {
  var textbox = $(e.target);
  var value = textbox.val().trim();
  //   console.log(value);
  var submitButton = document.querySelector('#submitPostButton');

  if (value === '') {
    //any value given to disabled results in truthy value
    submitButton.setAttribute('disabled', '');
    return;
  }
  //to set the disabled to false you need to remove it, setAttribute to false doesnt work
  submitButton.removeAttribute('disabled');
});

document.getElementById('replyTextArea').addEventListener('keyup', (e) => {
  var textbox = $(e.target);
  var value = textbox.val().trim();
  var submitButton = document.querySelector('#submitReplyButton');

  if (value === '') {
    submitButton.setAttribute('disabled', '');
    return;
  }
  submitButton.removeAttribute('disabled');
});

//checking if modal is open
//then adding the clicked post to it

$('#replyModal').on('show.bs.modal', (e) => {
  var button = $(e.relatedTarget);
  var postId = getPostIdFromElement(button);
  document.querySelector('#submitReplyButton').setAttribute('data-id', postId);

  $.get(`/api/posts/${postId}`, (results) => {
    outputPosts(results, $('#originalPostContainer'));
  });
});

//removing the post on closing the modal

$('#replyModal').on('hidden.bs.modal', () =>
  $('#originalPostContainer').html('')
);

//click handler to submit the REPLY to TWEETS
document.querySelector('#submitReplyButton').addEventListener('click', (e) => {
  var button = document.querySelector('#submitReplyButton');
  var textbox = document.getElementById('replyTextArea');

  var id = button.getAttribute('data-id');

  var data = {
    content: textbox.value,
    replyTo: id,
  };

  $.post('/api/posts', data, (postData) => {
    location.reload();
  });
});

//click handler to submit the TWEETS
document.querySelector('#submitPostButton').addEventListener('click', (e) => {
  var button = document.querySelector('#submitPostButton');
  var textbox = document.getElementById('postTextArea');

  var data = {
    content: textbox.value,
  };

  $.post('/api/posts', data, (postData) => {
    var html = createPostHtml(postData);
    document
      .querySelector('.postsContainer')
      .insertAdjacentHTML('afterbegin', html);
    textbox.value = '';
    button.setAttribute('disabled', '');
  });
});

//Event delegation

//cannot directly add click event listener to dynamic js content

// document.body.addEventListener('click', function (e) {
//   console.log(e.target);
//   if (e.target.id == 'brnPrepend') {
//     //do something
//     alert('button clicked');
//   }
// });

//LIKE BUTTON

$(document).on('click', '.likeButton', (e) => {
  var button = $(e.target);
  var postId = getPostIdFromElement(button);
  // console.log(postId);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      // console.log(postData.likes.length);

      button.find('span').text(postData.likes.length || '');

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

//RETWEET

$(document).on('click', '.retweetButton', (e) => {
  var button = $(e.target);
  var postId = getPostIdFromElement(button);
  // console.log(postId);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      button.find('span').text(postData.retweetUsers.length || '');

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
  location.reload();
});

//for going to the individual posts page

$(document).on('click', '.post', (e) => {
  var element = $(e.target);
  var postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is('button')) {
    window.location.href = `/posts/${postId}`;
  }
});

const getPostIdFromElement = (element) => {
  var isRoot = element.hasClass('post');
  var rootElement = isRoot ? element : element.closest('.post');

  if (rootElement.data().id === undefined) return alert('invalid post');

  return rootElement.data().id;
};

const createPostHtml = (postData) => {
  if (postData == null) return alert('No post data');

  //now checking if the tweet to be disoplayed is a retweet or not , if yes then we need to change the path of the content as it will be different in the retweet and is populatewd usingthe original tweet
  var isRetweet = postData.retweetData !== undefined;
  // console.log(isRetweet);
  var retweetedBy = isRetweet ? postData.postedBy.username : null;
  //originally retweetdata is an id but the is changed and ppoluated to the original tweeet and then contains everything that was present in the original tweet
  postData = isRetweet ? postData.retweetData : postData;

  var postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return console.log('User object not populated');
  }

  var displayName = postedBy.firstName + ' ' + postedBy.lastName;
  var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? 'active'
    : '';

  var retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? 'active'
    : '';

  var retweetText = '';
  if (isRetweet) {
    retweetText = `<span>
                    <i class="fas fa-retweet"></i>
                    Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                  </span>`;
  }

  var replyFlag = '';

  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      console.log('replyTo is not populated');
    }
    var replyToUsername = postData.replyTo.postedBy.username;

    replyFlag = `<div class="replyFlag">
        Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a>
    </div>`;
  }

  return `<div class='post' data-id='${postData._id}'>
            <div class="postActionContainer">
              ${retweetText}
            </div>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img src='${postedBy.profilePic}' />
              </div>
              <div class='postContentContainer'>
                <div class="header">
                  <a class='displayName' href='/profile/${
                    postedBy.username
                  }'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                </div>
                ${replyFlag}
                <div class="postBody">
                  <span>${postData.content}</span>
                </div>
                <div class="postFooter">
                    <div class="postButtonContainer">
                      <button type="button" data-toggle="modal" data-target="#replyModal">
                        <i class="far fa-comment"></i>
                      </button>
                    </div>
                    <div class="postButtonContainer green">
                      <button class="retweetButton ${retweetButtonActiveClass}">
                        <i class="fas fa-retweet"></i>
                        <span>${
                          postData.retweetUsers.length > 0
                            ? postData.retweetUsers.length
                            : ''
                        }</span>
                      </button>
                    </div>
                    <div class="postButtonContainer red">
                      <button class="likeButton ${likeButtonActiveClass}">
                        <i class="far fa-heart" id="brnPrepend"></i>
                        <span>${
                          postData.likes.length > 0 ? postData.likes.length : ''
                        }</span>
                      </button>
                    </div>
                </div>
              </div>
            </div>
          </div>`;
};

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) {
      return 'Just now';
    }
    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago';
  }
}

const outputPosts = (results, container) => {
  container.html('');

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span class='noResult'>Nothing to show</span>");
  }
};
