import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { apiFetch } from "../api";

export default function Post() {
  const [selected, setSelected] = useState("posts");
  const [theme, setTheme] = useState("light");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentInputs, setCommentInputs] = useState({}); // store comment text per post

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await apiFetch("/posts");

      const safePosts = data.map((p) => ({
        ...p,
        likes: p.likes || [],
        comments: p.comments || [],
      }));

      setPosts(safePosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = async () => {
    if (!newPost.trim()) return;
    try {
      const data = await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({ content: newPost }),
      });
      setPosts([{ ...data, comments: [] }, ...posts]);
      setNewPost("");
    } catch (err) {
      console.error("Failed to add post:", err.message);
    }
  };

  const editPost = async (id) => {
    const post = posts.find((p) => p._id === id);
    const updatedContent = prompt("Edit post:", post.content);
    if (!updatedContent) return;

    try {
      const data = await apiFetch(`/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({ content: updatedContent }),
      });

      setPosts(posts.map((p) => (p._id === id ? data : p)));
    } catch (err) {
      console.error("Failed to edit post:", err.message);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiFetch(`/posts/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err.message);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const updatedPost = await apiFetch(`/posts/${postId}/like`, {
        method: "POST",
      });

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...updatedPost, likes: updatedPost.likes || [] }
            : p,
        ),
      );
    } catch (err) {
      console.error("Failed to like/unlike post:", err.message);
    }
  };

  // ✅ ADD COMMENT FUNCTION
  const addComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const updatedPost = await apiFetch(`/posts/${postId}/comment`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...updatedPost, comments: updatedPost.comments || [] }
            : p,
        ),
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err.message);
    }
  };

  return (
    <div className="app">
      <Sidebar selected={selected} onSelect={setSelected} requestCount={0} />
      <div className="main">
        <Header toggleTheme={toggleTheme} />

        <h2>Posts</h2>

        <div className="add-post">
          <input
            type="text"
            placeholder="Write a new post..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button onClick={addPost}>Add Post</button>
        </div>

        {loadingPosts ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul className="post-list">
            {posts.map((post) => {
              const isLiked =
                userId && post.likes?.some((id) => id.toString() === userId);

              return (
                <li key={post._id}>
                  <span>{post.content}</span>

                  <div className="post-actions">
                    <button onClick={() => editPost(post._id)}>Edit</button>
                    <button onClick={() => deletePost(post._id)}>Delete</button>

                    <button
                      onClick={() => toggleLike(post._id)}
                      style={{
                        backgroundColor: isLiked ? "#6c5ce7" : "#ddd",
                        color: isLiked ? "#fff" : "#000",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ❤️ {post.likes?.length ?? 0}
                    </button>
                  </div>

                  {/* ✅ COMMENT SECTION */}
                  <div className="comments-section">
                    <h4>Comments</h4>

                    {post.comments?.length === 0 ? (
                      <p>No comments yet</p>
                    ) : (
                      <ul>
                        {post.comments.map((comment) => (
                          <li key={comment._id}>
                            <strong>{comment.user?.username || "User"}:</strong>{" "}
                            {comment.text}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post._id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addComment(post._id);
                        }}
                      />
                      <button onClick={() => addComment(post._id)}>
                        Comment
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
