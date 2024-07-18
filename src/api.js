const BASE_URL = "https://learn.codeit.kr/api/codestudit";

// 포스트 목록을 받아오는 함수
export async function getPosts(page = 0, limit = 10) {
  const response = await fetch(`${BASE_URL}/posts?page=${page}&limit=${limit}`);
  return await response.json();
  // throw new Error('An error occured!');
}

// 특정 유저의 포스트만 받아오는 함수
export async function getPostsByUsername(username) {
  const response = await fetch(`${BASE_URL}/posts?username=${username}`);
  return await response.json();
}

// 포스트 업로드를 요청하는 함수
export async function uploadPost(newPost) {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPost),
  });

  if (!response.ok) {
    throw new Error("Failed to upload the post.");
  }

  return await response.json();
}

// 유저 정보를 받아오는 함수
export async function getUserInfo(username) {
  const response = await fetch(`${BASE_URL}/users/${username}`);
  return await response.json();
}

// 포스트의 좋아요 데이터를 받아오는 함수
export async function getLikeCountByPostId(postId) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/likes`);
  const body = await response.json();
  return body.count;
}

export async function getLikeStatusByUsername(postId, username) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/likes/${username}`);
  if (response.status === 200) {
    return true;
  } else if (response.status === 404) {
    return false;
  } else {
    throw new Error("Failed to get like status of the post.");
  }
}

// 좋아요 실행 함수
export async function likePost(postId, username) {
  const response = await fetch(
    `${BASE_URL}/posts/${postId}/likes/${username}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to like the post.");
  }
}

// 좋아요 취소 함수
export async function unlikePost(postId, username) {
  const response = await fetch(
    `${BASE_URL}/posts/${postId}/likes/${username}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to unlike the post.");
  }
}