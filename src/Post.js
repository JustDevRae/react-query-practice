import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLikeCountByPostId,
  getLikeStatusByUsername,
  likePost,
  unlikePost,
} from "./api";

function Post({ post, currentUsername }) {
  const queryClient = useQueryClient();

  const { data: likeCount } = useQuery({
    queryKey: ["likeCount", post.id],
    queryFn: () => getLikeCountByPostId(post.id),
  });

  const { data: isPostLikedByCurrentUser } = useQuery({
    queryKey: ["likeStatus", post.id, currentUsername],
    queryFn: () => getLikeStatusByUsername(post.id, currentUsername),
    enabled: !!currentUsername,
  });

  const likesMutation = useMutation({
    mutationFn: async ({ postId, username, userAction }) => {
      if (userAction === "LIKE_POST") {
        await likePost(postId, username);
      } else {
        await unlikePost(postId, username);
      }
    },
    onMutate: async ({ postId, username, userAction }) => {
      await queryClient.cancelQueries({
        queryKey: ["likeStatus", postId, username],
      });
      await queryClient.cancelQueries({ queryKey: ["likeCount", postId] });

      const prevLikeStatus = queryClient.getQueryData([
        "likeStatus",
        postId,
        username,
      ]);
      const prevLikeCount = queryClient.getQueryData(["likeCount", postId]);

      queryClient.setQueryData(
        ["likeStatus", postId, username],
        () => userAction === "LIKE_POST"
      );
      queryClient.setQueryData(["likeCount", postId], (prev) =>
        userAction === "LIKE_POST" ? prev + 1 : prev - 1
      );

      return { prevLikeStatus, prevLikeCount };
    },
    onError: (err, { postId, username }, context) => {
      queryClient.setQueryData(
        ["likeStatus", postId, username],
        context.prevLikeStatus
      );
      queryClient.setQueryData(["likeCount", postId], context.prevLikeCount);
    },
    onSettled: (data, err, { postId, username }) => {
      queryClient.invalidateQueries({
        queryKey: ["likeStatus", postId, username],
      });
      queryClient.invalidateQueries({
        queryKey: ["likeCount", postId],
      });
    },
  });

  const handleLikeButtonClick = (userAction) => {
    console.log("@@@here", currentUsername);
    if (!currentUsername) return;
    likesMutation.mutate({
      postId: post.id,
      username: currentUsername,
      userAction,
    });
  };

  return (
    <li>
      <div>
        {post.user.name}: {post.content}
      </div>
      <button
        onClick={() =>
          handleLikeButtonClick(
            isPostLikedByCurrentUser ? "UNLIKE_POST" : "LIKE_POST"
          )
        }
      >
        {isPostLikedByCurrentUser ? "♥️ " : "♡ "}
        {`좋아요 ${likeCount ?? 0}개`}
      </button>
    </li>
  );
}

export default Post;
