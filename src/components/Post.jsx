import '../css/Post.css';
import React, { useState } from 'react';

const Post = ({ post }) => {
    const [likes, setLikes] = useState(post.likes);
    const [comments, setComments] = useState(post.comments);
    const [commentText, setCommentText] = useState('');

    const handleLike = () => {
        setLikes(likes + 1); // Increase likes infinitely on each click
    };

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const submitComment = (e) => {
        e.preventDefault(); // Prevent the form from submitting traditionally
        if (commentText.trim()) {
            const newComment = {
                user: 'User', // This should be the actual username from the user context or state
                comment: commentText,
            };
            setComments([...comments, newComment]);
            setCommentText(''); // Clear the comment input after submission
        }
    };

    return (
        <div className="post">
            <div className="avatar-placeholder"></div>
            <div className="post-content">
                <div className="profile-name">{post.user}</div>
                <div className="song-name">{post.songTitle}</div>
                <div className="artist-name">{post.artist}</div>
                <div className="post-interactions">
                    <button className="like-button" onClick={handleLike}>
                        ❤️ {likes} Likes
                    </button>
                    <span className="comments">
                        💬 {comments.length} Comments
                    </span>
                </div>
                <div className="comment-input-area">
                    <form onSubmit={submitComment}>
                        <input
                            type="text"
                            value={commentText}
                            onChange={handleCommentChange}
                            placeholder="Write a comment..."
                        />
                        <button type="submit">Comment</button>
                    </form>
                </div>
                <div className="comments-list">
                    {comments.map((comment, index) => (
                        <div key={index} className="comment">
                            <strong>{comment.user}</strong>: {comment.comment}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Post;
