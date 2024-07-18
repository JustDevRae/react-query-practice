import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { getPosts, uploadPost, getUserInfo } from "./api";

const PAGE_LIMIT = 3;

function HomePage() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [page, setPage] = useState(0);
  const {
    data: postsData,
    isPending,
    isError,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["posts", page],
    queryFn: () => getPosts(page, PAGE_LIMIT),
    placeholderData: keepPreviousData,
    retry: 0,
  });

  const { data: userInfoData, isPending: isUserInfoPending } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfo(currentUsername),
    enabled: !!currentUsername,
  });

  const uploadPostMutation = useMutation({
    mutationFn: (newPost) =>
      uploadPost(newPost, {
        onSuccess: () => {
          console.log("onSuccess in mutate");
        },
        onSettled: () => {
          console.log("onSettled in mutate");
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      console.log("onSuccess in useMutation");
    },
    onSettled: () => {
      console.log("onSettled in useMutation");
    },
  });

  const handleInputChange = (e) => {
    setContent(e.target.value);
  };

  const handleLoginButtonClick = () => {
    setCurrentUsername("codeit");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = { username: "codeit", content };
    uploadPostMutation.mutate(newPost);
    setContent("");
  };

  const loginMessage = isUserInfoPending
    ? "로그인 중입니다..."
    : `${userInfoData?.name}님 환영합니다!`;

  if (isPending) return "로딩 중입니다...";

  if (isError) return "에러가 발생했습니다.";

  const posts = postsData?.results ?? [];

  return (
    <>
      <div>
        {currentUsername ? (
          loginMessage
        ) : (
          <button onClick={handleLoginButtonClick}>codeit으로 로그인</button>
        )}
        <form onSubmit={handleSubmit}>
          <textarea
            name="content"
            value={content}
            onChange={handleInputChange}
          />
          <button disabled={!content} type="submit">
            업로드
          </button>
        </form>
      </div>
      <div>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              {post.user.name}: {post.content}
            </li>
          ))}
        </ul>
        <div>
          <button
            disabled={page === 0}
            onClick={() => setPage((old) => Math.max(old - 1, 0))}
          >
            &lt;
          </button>
          <button
            disabled={isPlaceholderData || !postsData?.hasMore}
            onClick={() => setPage((old) => old + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
    </>
  );
}

export default HomePage;
