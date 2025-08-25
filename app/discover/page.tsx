"use client";

import { useState, useEffect } from "react";

export default function DiscoverPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchIdeas = async () => {
    const params = new URLSearchParams({
      q: debouncedQuery,
      sortByDate: sortBy === "newest" || sortBy === "oldest" ? sortBy : "",
      sortByLikes:
        sortBy === "mostLikes"
          ? "most"
          : sortBy === "leastLikes"
          ? "least"
          : "",
      sortByComments:
        sortBy === "mostComments"
          ? "most"
          : sortBy === "leastComments"
          ? "least"
          : "",
      page: page.toString(),
      limit: "10",
    });

    const res = await fetch(`/api/ideas?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setIdeas(data.data);
      setTotalPages(data.meta.totalPages);
    } else {
      console.error("Failed to fetch ideas");
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [debouncedQuery, sortBy, page]);

  return (
    <div>
      <h1>Discover Ideas</h1>

      <div>
        <input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mostLikes">Most Likes</option>
          <option value="leastLikes">Least Likes</option>
          <option value="mostComments">Most Comments</option>
          <option value="leastComments">Least Comments</option>
        </select>
      </div>

      <div>
        {ideas.map((idea) => (
          <div key={idea.id}>
            <img src={idea.imageUrl ?? undefined} alt="idea cover image" />
            <h2>{idea.title}</h2>
            <p>{idea.problem}</p>
            <p>{idea.description}</p>
            <p>Author: {idea.user.name}</p>
            <p>Comments: {idea.comments.length}</p>
            <p>Likes: {idea.likes.length}</p>
            <hr />
          </div>
        ))}
      </div>

      <div>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          {" "}
          Page {page} of {totalPages}{" "}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
