import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    initQuill();
    setupEventListeners();
    await loadPosts();
});

function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

function setupEventListeners() {
    const newPostBtn = document.getElementById('newPostBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const postForm = document.getElementById('postForm');
    const modal = document.getElementById('newPostForm');

    newPostBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        resetForm();
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSubmit();
    });
}

async function handleSubmit() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;
    
    showSpinner();
    
    try {
        await backend.createPost(title, content, author);
        document.getElementById('newPostForm').classList.add('hidden');
        resetForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        hideSpinner();
    }
}

function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    quill.setContents([]);
}

async function loadPosts() {
    showSpinner();
    
    try {
        const posts = await backend.getAllPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Failed to load posts. Please refresh the page.');
    } finally {
        hideSpinner();
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const date = new Date(Number(post.timestamp) / 1000000);
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${date.toLocaleDateString()}</span>
            </div>
            <div class="post-content">${post.body}</div>
        `;
        postsContainer.appendChild(postElement);
    });
}

function showSpinner() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}
