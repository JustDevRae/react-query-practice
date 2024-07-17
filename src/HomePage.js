import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, getPostsByUsername, uploadPost } from './api';
import { useState } from 'react';

function HomePage() {
  const [content, setContent] = useState("");

  const queryClient = useQueryClient();

  const uploadPostMutation = useMutation({
    mutationFn: (newPost) => uploadPost(newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      console.log("onSuccess in useMutation");
    },
    onSettled: () => {
      console.log("onSettled in useMutation");
    },
  });

  const handleInputChange = (e) => {
    setContent(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = { username: 'codeit', content };
    uploadPostMutation.mutate(newPost, {
      onSuccess: () => {
        console.log('onSuccess in mutate');
      },
      onSettled: () => {
        console.log('onSettled in mutate');
      },
    });
    setContent('');
  }
  // const result = useQuery({ queryKey: ['posts'], queryFn: getPosts });
  // console.log(result);

  // const username = 'codeit';
  // const { data: postDataByUsername } = useQuery({
  //   queryKey: ['posts', username, { status: 'private' }],
  //   queryFn: () => getPostsByUsername(username),
  //   // queryFn: ({ queryKey }) => getPostsByUserId(queryKey[1]), 
  // });
  // console.log(postDataByUsername);

  // const { error, isError } = useQuery({
  //   queryKey: ['posts'],
  //   queryFn: async (key) => {
  //     throw new Error('An error occurred!');
  //   },
  // })
  // console.log(error); // null 반환
  // console.log(isError); // false 반환


  const { data: postsData, isPending, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    retry: 0,
  });

  if (isPending) return '로딩 중입니다...';
  if (isError) return '에러가 발생했습니다.';

  const posts = postsData?.results ?? [];
  queryClient.invalidateQueries();

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <textarea
            name='content'
            value={content}
            onChange={handleInputChange}
          />
          <button
            disabled={uploadPostMutation.isPending || !content}
            type='submit'
          >
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
      </div>
    </>
  );
}

export default HomePage;
