// Global Toast System
export function showToast(message, type = 'info') {
    let container = document.getElementById("global-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "global-toast-container";
        container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto flex items-center gap-2 max-w-sm bg-white";
    
    // Icon & Color scheme based on type
    let icon = '';
    if (type === 'success') {
        toast.classList.add('border-green-200', 'text-green-800');
        icon = '<span class="text-green-500">✓</span>';
    } else if (type === 'error') {
        toast.classList.add('border-red-200', 'text-red-800');
        icon = '<span class="text-red-500">⚠️</span>';
    } else {
        toast.classList.add('border-slate-200', 'text-slate-800');
        icon = '<span class="text-blue-500">ℹ️</span>';
    }

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    // Trigger transition
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Auto-remove
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// Sanitize user content before inserting into innerHTML (prevent stored XSS)
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Common Rendering for Post Elements
export function createPostElement(post, currentUser, options = {}) {
    const isOwner = currentUser && post.user_id === currentUser.uid;
    const likeCount = post.likes?.[0]?.count || 0;
    const commentCount = post.comments?.[0]?.count || 0;
    const avatar = post.profiles?.avatar_url || 'src/assets/avatar-placeholder.png';
    const name = post.profiles?.full_name || 'Anonymous';
    const username = post.profiles?.username || '';

    const isLiked = post.is_liked_by_user || false;
    const isSaved = options.isSavedPage || post.is_saved_by_user || false;

    let myAvatar = 'src/assets/avatar-placeholder.png';
    if (currentUser && currentUser.photoURL) {
        myAvatar = currentUser.photoURL;
    } else {
        const navImg = document.getElementById('nav-profile-img');
        if (navImg && navImg.src) myAvatar = navImg.src;
    }

    const div = document.createElement('div');
    div.className = "post-card bg-white p-5 rounded-2xl shadow border border-slate-200 mb-6 relative group overflow-hidden";
    div.dataset.authorId = post.user_id;

    let mediaHTML = '';
    if (post.media_url) {
        mediaHTML = post.media_type === 'video'
            ? `<video controls src="${post.media_url}" class="mt-4 rounded-lg w-full max-h-96 object-cover bg-black"></video>`
            : `<img src="${post.media_url}" loading="lazy" class="mt-4 rounded-lg w-full max-h-96 object-cover bg-slate-100">`;
    }

    const deleteBtn = isOwner ? `
    <button class="delete-btn absolute top-5 right-5 text-slate-300 hover:text-red-500 transition p-2" title="Delete" data-post-id="${post.id}">
        <i data-lucide="trash-2" class="w-5 h-5"></i>
    </button>` : '';

    div.innerHTML = `
    ${deleteBtn}
    <div class="flex items-start gap-4">
        <a href="profile.html?username=${username}" class="flex-shrink-0">
            <img src="${avatar}" class="w-12 h-12 rounded-full object-cover border border-slate-200" 
                 onerror="this.src='src/assets/avatar-placeholder.png'">
        </a>
        <div class="w-full">
            <div class="flex justify-between items-start">
                <div>
                    <a href="profile.html?username=${username}" class="font-bold text-slate-900 hover:underline">${name}</a>
                    <p class="text-xs text-slate-500">${new Date(post.created_at).toLocaleString()}</p>
                </div>
            </div>
            <p class="mt-3 text-slate-800 text-lg whitespace-pre-wrap break-words" style="overflow-wrap:anywhere;word-break:break-word">${escapeHtml(post.content || '')}</p>
            ${mediaHTML}
            
            <div class="flex items-center gap-6 mt-6 border-t border-slate-100 pt-4 text-slate-500 text-sm font-medium">
                <button class="like-btn flex items-center gap-2 hover:text-red-500 transition ${isLiked ? 'text-red-500' : ''}" data-post-id="${post.id}">
                    <i data-lucide="heart" class="w-5 h-5 ${isLiked ? 'fill-current' : ''}"></i> <span>${likeCount}</span>
                </button>
                <button class="comment-btn flex items-center gap-2 hover:text-blue-500 transition" data-post-id="${post.id}">
                    <i data-lucide="message-circle" class="w-5 h-5"></i> <span>${commentCount}</span>
                </button>
                <button class="save-btn flex items-center gap-2 hover:text-green-500 transition ${isSaved ? 'text-green-500' : ''}" data-post-id="${post.id}">
                    <i data-lucide="bookmark" class="w-5 h-5 ${isSaved ? 'fill-current' : ''}"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>
                </button>
            </div>

            <div class="comment-section hidden mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-xl p-4">
                <div class="comments-list max-h-60 overflow-y-auto mb-4"></div>
                <form class="comment-form flex gap-2 items-center" data-post-id="${post.id}">
                    <img src="${myAvatar}" 
                         class="current-user-avatar w-8 h-8 rounded-full border border-slate-200 object-cover"
                         onerror="this.src='src/assets/avatar-placeholder.png'">
                    <input type="text" placeholder="Write a comment..." class="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none">
                    <button type="submit" class="text-brand-blue font-bold text-sm px-2">Post</button>
                </form>
            </div>
        </div>
    </div>
    `;

    return div;
}

// Shimmering Skeleton Loader for Posts
export function createPostSkeleton() {
    const div = document.createElement('div');
    div.className = "post-card bg-white p-5 rounded-2xl shadow border border-slate-200 mb-6 animate-pulse";
    div.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div class="w-full">
                <div class="flex justify-between items-start">
                    <div class="w-full space-y-2">
                        <div class="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div class="h-3 bg-slate-100 rounded w-1/4"></div>
                    </div>
                </div>
                <div class="space-y-2 mt-4">
                    <div class="h-4 bg-slate-200 rounded w-full"></div>
                    <div class="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
                <div class="flex items-center gap-6 mt-6 border-t border-slate-100 pt-4">
                    <div class="h-4 bg-slate-100 rounded w-12"></div>
                    <div class="h-4 bg-slate-100 rounded w-12"></div>
                    <div class="h-4 bg-slate-100 rounded w-12"></div>
                </div>
            </div>
        </div>
    `;
    return div;
}
