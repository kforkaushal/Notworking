// ─── Global Toast System ──────────────────────────────────────────────────────
export function showToast(message, type = 'info') {
    let container = document.getElementById("global-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "global-toast-container";
        container.className = "fixed bottom-5 right-5 z-[9998] flex flex-col gap-2 pointer-events-none";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto flex items-center gap-2 max-w-sm bg-white";

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

    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ─── Auth Gate Modal ──────────────────────────────────────────────────────────
// Shown to guests who try to interact with a post action.
export function showAuthGateModal() {
    let modal = document.getElementById('nw-auth-gate-modal');
    if (modal) {
        modal.style.display = 'flex';
        const card = modal.querySelector('#nw-auth-gate-card');
        if (card) {
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        }
        return;
    }

    modal = document.createElement('div');
    modal.id = 'nw-auth-gate-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;';

    modal.innerHTML = `
        <div id="nw-auth-gate-card" style="background:#fff;border-radius:1.5rem;box-shadow:0 25px 50px rgba(0,0,0,0.25);max-width:380px;width:100%;padding:2.5rem 2rem;text-align:center;transform:scale(0.9);opacity:0;transition:transform 0.25s ease, opacity 0.25s ease;">
            <div style="width:64px;height:64px;background:#f1f5f9;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
                <svg style="width:32px;height:32px;color:#334155;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            </div>
            <h3 style="font-size:1.375rem;font-weight:900;color:#0f172a;margin-bottom:0.5rem;">Join the Slacker Network</h3>
            <p style="color:#64748b;font-size:0.875rem;margin-bottom:2rem;line-height:1.6;">Like, comment, save &amp; follow — sign in to continue your professional journey of doing nothing.</p>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <a href="/Auth/login.html" style="display:block;padding:0.75rem 1rem;background:#0f172a;color:#fff;font-weight:700;border-radius:999px;font-size:0.875rem;text-decoration:none;transition:background 0.2s;">Log In</a>
                <a href="/Auth/signup.html" style="display:block;padding:0.75rem 1rem;background:#ef4444;color:#fff;font-weight:700;border-radius:999px;font-size:0.875rem;text-decoration:none;transition:background 0.2s;">Sign Up — It's Free</a>
                <button id="nw-auth-gate-dismiss" style="background:none;border:none;color:#94a3b8;font-size:0.875rem;cursor:pointer;margin-top:0.25rem;padding:0.25rem;">Maybe later</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => {
        const card = modal.querySelector('#nw-auth-gate-card');
        if (card) {
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideAuthGateModal();
    });
    modal.querySelector('#nw-auth-gate-dismiss').addEventListener('click', hideAuthGateModal);
}

function hideAuthGateModal() {
    const modal = document.getElementById('nw-auth-gate-modal');
    if (!modal) return;
    const card = modal.querySelector('#nw-auth-gate-card');
    if (card) {
        card.style.transform = 'scale(0.9)';
        card.style.opacity = '0';
    }
    setTimeout(() => { if (modal) modal.style.display = 'none'; }, 250);
}

// ─── Close all open post menus ────────────────────────────────────────────────
export function closeAllPostMenus() {
    document.querySelectorAll('.post-dropdown-menu').forEach(m => {
        m.style.display = 'none';
    });
    document.querySelectorAll('.share-submenu').forEach(m => {
        m.style.display = 'none';
    });
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str || '')));
    return div.innerHTML;
}

function buildPostUrl(postId) {
    const origin = window.location.origin;
    return `${origin}/feed.html?post=${postId}`;
}

function formatDateLong(dateStr) {
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ─── createPostElement ────────────────────────────────────────────────────────
export function createPostElement(post, currentUser, options = {}) {
    const isOwner = currentUser && post.user_id === currentUser.uid;
    const isGuest = !currentUser;

    const likeCount = post.likes?.[0]?.count ?? 0;
    const commentCount = post.comments?.[0]?.count ?? 0;
    const avatar = post.profiles?.avatar_url || 'src/assets/avatar-placeholder.png';
    const name = post.profiles?.full_name || 'Anonymous';
    const username = post.profiles?.username || '';
    const postUrl = buildPostUrl(post.id);
    const postDateLong = formatDateLong(post.created_at);
    const postDateShort = new Date(post.created_at).toLocaleString();

    const isLiked = post.is_liked_by_user || false;
    const isSaved = options.isSavedPage || post.is_saved_by_user || false;

    // Current user's avatar for comment box (prefer live nav-profile-img DOM value)
    let myAvatar = 'src/assets/avatar-placeholder.png';
    const navImg = document.getElementById('nav-profile-img');
    if (navImg && navImg.src && !navImg.src.includes('avatar-placeholder')) {
        myAvatar = navImg.src;
    } else if (currentUser && currentUser.photoURL) {
        myAvatar = currentUser.photoURL;
    }

    // Share URLs
    const shareText = encodeURIComponent('Check this out on NotWorking');
    const shareUrl = encodeURIComponent(postUrl);
    const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
    const telegramUrl = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;

    const div = document.createElement('div');
    div.className = 'post-card bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-slate-200/80 mb-5 overflow-visible transition-shadow hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)]';
    div.dataset.authorId = post.user_id;
    div.dataset.postId = String(post.id);

    // Media HTML (full-width, between header and actions)
    let mediaHTML = '';
    if (post.media_url) {
        mediaHTML = post.media_type === 'video'
            ? `<div class="border-y border-slate-100 bg-slate-950 flex items-center justify-center overflow-hidden"><video controls src="${post.media_url}" class="w-full max-h-[500px] object-contain bg-black"></video></div>`
            : `<div class="border-y border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden"><img src="${post.media_url}" loading="lazy" alt="Post media" class="w-full max-h-[500px] object-contain cursor-pointer hover:opacity-95 transition duration-300"></div>`;
    }

    // Delete item only for owner (inside 3-dot menu)
    const deleteMenuItem = isOwner ? `
        <hr class="border-slate-100 mx-4 my-1">
        <button class="three-dot-item delete-from-menu-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left" data-post-id="${post.id}">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete post
        </button>` : '';

    // Hide "Follow" item on own posts
    const followDisplay = isOwner ? 'display:none;' : '';

    div.innerHTML = `
        <!-- ── Post Header ─────────────────────────────── -->
        <div class="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <a href="profile.html?username=${escapeHtml(username)}" class="flex-shrink-0 relative group">
                    <img src="${avatar}" class="w-11 h-11 rounded-full object-cover border border-slate-100 hover:ring-2 hover:ring-blue-100 transition-all"
                         onerror="this.src='src/assets/avatar-placeholder.png'" alt="${escapeHtml(name)}" loading="lazy">
                </a>
                <div class="min-w-0 flex-1">
                    <a href="profile.html?username=${escapeHtml(username)}" class="font-bold text-slate-800 hover:text-blue-600 hover:underline text-[15px] leading-tight block truncate">${escapeHtml(name)}</a>
                    <p class="text-xs text-slate-400 mt-0.5 font-normal">@${escapeHtml(username)} · ${postDateShort}</p>
                </div>
            </div>

            <!-- ── 3-Dot Menu ──────────────────────────── -->
            <div class="relative flex-shrink-0">
                <button class="three-dot-btn p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-150 active:scale-95" data-post-id="${post.id}" title="More options" aria-label="Post options">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                    </svg>
                </button>
                <!-- Dropdown -->
                <div class="post-dropdown-menu" style="display:none;position:absolute;right:0;top:calc(100% + 4px);z-index:40;background:#fff;border:1px solid #e2e8f0;border-radius:1rem;box-shadow:0 10px 40px rgba(0,0,0,0.12);width:220px;padding:6px 0;overflow:hidden;">

                    <!-- Copy Link -->
                    <button class="three-dot-item copy-link-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left" data-post-id="${post.id}" data-post-url="${postUrl}">
                        <svg class="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        Copy post link
                    </button>

                    <!-- Follow/Unfollow -->
                    <button class="three-dot-item follow-from-menu-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                        style="${followDisplay}" data-post-id="${post.id}" data-author-id="${post.user_id}" data-author-username="${escapeHtml(username)}" data-requires-auth="true">
                        <svg class="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <span class="follow-menu-label">${post.is_following_author ? `Unfollow @${escapeHtml(username)}` : `Follow @${escapeHtml(username)}`}</span>
                    </button>

                    <!-- About -->
                    <button class="three-dot-item about-post-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left" data-post-id="${post.id}">
                        <svg class="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        About this post
                    </button>
                    <!-- About panel (inline, revealed by JS) -->
                    <div class="about-post-panel" style="display:none;padding:10px 16px 12px;background:#f8fafc;border-top:1px solid #f1f5f9;font-size:0.75rem;color:#64748b;line-height:1.6;">
                        <p><span style="font-weight:600;color:#334155;">Posted by:</span> ${escapeHtml(name)} (@${escapeHtml(username)})</p>
                        <p><span style="font-weight:600;color:#334155;">Posted at:</span> ${postDateLong}</p>
                        <p style="word-break:break-all;"><span style="font-weight:600;color:#334155;">Post ID:</span> ${post.id}</p>
                    </div>

                    <!-- Save -->
                    <button class="three-dot-item save-from-menu-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors text-left ${isSaved ? 'text-green-600' : 'text-slate-700'}"
                        data-post-id="${post.id}" data-is-saved="${isSaved ? '1' : '0'}" data-requires-auth="true">
                        <svg class="w-4 h-4 flex-shrink-0 ${isSaved ? 'text-green-500' : 'text-slate-500'}" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                        <span class="save-menu-label">${isSaved ? 'Unsave post' : 'Save post'}</span>
                    </button>

                    ${deleteMenuItem}
                </div>
            </div>
        </div>

        <!-- ── Post Content ────────────────────────────── -->
        <div class="px-5 pb-3">
            <p class="text-slate-700 text-[15px] whitespace-pre-wrap break-words leading-relaxed font-normal" style="overflow-wrap:anywhere;word-break:break-word">${escapeHtml(post.content || '')}</p>
        </div>

        <!-- ── Media ──────────────────────────────────── -->
        ${mediaHTML}

        <!-- ── Action Bar ─────────────────────────────── -->
        <div class="px-4 py-1.5 flex items-center gap-1 border-t border-slate-100 bg-slate-50/20">

            <!-- Like -->
            <button class="like-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 ${isLiked ? 'text-red-500 bg-red-50/70' : 'text-slate-500 hover:text-red-500 hover:bg-red-50/50'}"
                data-post-id="${post.id}" data-requires-auth="true" title="Like">
                <svg class="w-5 h-5" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <span>${likeCount}</span>
            </button>

            <!-- Comment -->
            <button class="comment-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-150 active:scale-95"
                data-post-id="${post.id}" title="Comment">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <span>${commentCount}</span>
            </button>

            <!-- Share (always available — no auth needed) -->
            <div class="relative ml-auto">
                <button class="share-btn flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all duration-150 active:scale-95"
                    data-post-id="${post.id}" data-post-url="${postUrl}" title="Share">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                    Share
                </button>

                <!-- Share Submenu -->
                <div class="share-submenu" style="display:none;position:absolute;bottom:calc(100% + 8px);right:0;z-index:40;background:#fff;border:1px solid #e2e8f0;border-radius:1rem;box-shadow:0 10px 40px rgba(0,0,0,0.12);width:210px;padding:6px 0;overflow:hidden;">
                    <p style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;padding:8px 16px 4px;">Share via</p>

                    <a class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                       href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">
                        <span style="font-size:1.1rem;">💬</span> WhatsApp
                    </a>
                    <a class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                       href="${twitterUrl}" target="_blank" rel="noopener noreferrer">
                        <span style="font-size:1.1rem;font-weight:900;">𝕏</span> X / Twitter
                    </a>
                    <a class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                       href="${telegramUrl}" target="_blank" rel="noopener noreferrer">
                        <span style="font-size:1.1rem;">✈️</span> Telegram
                    </a>
                    <button class="share-instagram-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left" data-post-url="${postUrl}">
                        <span style="font-size:1.1rem;">📸</span> Instagram (copy link)
                    </button>

                    <hr style="border-color:#f1f5f9;margin:4px 16px;">

                    <button class="copy-link-share-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left" data-post-url="${postUrl}">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                        Copy link
                    </button>

                    <button class="native-share-btn w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left" data-post-url="${postUrl}" data-post-title="Check this out on NotWorking" style="${navigator.share ? '' : 'display:none;'}">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        More options…
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Comment Section (toggled) ──────────────── -->
        <div class="comment-section" style="display:none;" data-post-id="${post.id}">
            <div class="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                <div class="comments-list max-h-64 overflow-y-auto mb-4 space-y-3"></div>
                ${!isGuest ? `
                <form class="comment-form flex gap-2 items-center" data-post-id="${post.id}">
                    <img src="${myAvatar}" class="current-user-avatar w-8 h-8 rounded-full border border-slate-200 object-cover flex-shrink-0" onerror="this.src='src/assets/avatar-placeholder.png'" alt="You">
                    <input type="text" placeholder="Write a comment…" class="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition">
                    <button type="submit" class="text-blue-600 font-bold text-sm px-2 hover:text-blue-700 transition">Post</button>
                </form>` : `
                <p class="text-sm text-slate-400 text-center py-1">
                    <a href="/Auth/login.html" class="font-semibold text-blue-600 hover:underline">Log in</a> or
                    <a href="/Auth/signup.html" class="font-semibold text-blue-600 hover:underline">sign up</a> to comment.
                </p>`}
            </div>
        </div>
    `;

    return div;
}

// ─── Shimmering Skeleton Loader ───────────────────────────────────────────────
export function createPostSkeleton() {
    const div = document.createElement('div');
    div.className = 'post-card bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-5 animate-pulse';
    div.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div class="flex-1">
                <div class="h-3.5 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div class="h-2.5 bg-slate-100 rounded w-1/4"></div>
            </div>
        </div>
        <div class="space-y-2 mt-4 ml-13">
            <div class="h-4 bg-slate-200 rounded w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-5/6"></div>
            <div class="h-4 bg-slate-100 rounded w-2/3"></div>
        </div>
        <div class="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
            <div class="h-4 bg-slate-100 rounded w-14"></div>
            <div class="h-4 bg-slate-100 rounded w-14"></div>
            <div class="h-4 bg-slate-100 rounded w-14 ml-auto"></div>
        </div>
    `;
    return div;
}

// ─── Shared Post Interaction Controllers ─────────────────────────────────────────

export async function createNotification(supabase, currentUser, type, entityId, recipientId) {
    if (!currentUser || currentUser.uid === recipientId) return;
    const payload = {
        type,
        user_id: recipientId,
        actor_id: currentUser.uid
    };
    if (type === 'like' || type === 'comment') {
        payload.post_id = entityId;
    }
    try {
        await supabase.from('notifications').insert(payload);
    } catch (error) {
        console.error("Notification failed:", error);
    }
}

export async function loadComments(supabase, currentUser, postId, container) {
    container.innerHTML = '<div class="text-xs text-slate-400 p-2">Loading...</div>';
    const { data: comments } = await supabase.from('comments')
        .select('id, user_id, content, created_at, profiles(username, avatar_url)')
        .eq('post_id', postId).order('created_at', { ascending: true });

    container.innerHTML = '';
    if (!comments || !comments.length) {
        container.innerHTML = '<div class="text-xs text-slate-400 p-2">No comments yet.</div>';
        return;
    }

    comments.forEach(c => {
        const isOwner = currentUser && c.user_id === currentUser.uid;
        const deleteBtn = isOwner ? `
            <button class="delete-comment-btn text-slate-400 hover:text-red-500 transition p-1" title="Delete Comment" data-comment-id="${c.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>` : '';

        const div = document.createElement('div');
        div.className = "comment-item flex gap-2 mb-2 text-sm group";
        div.dataset.authorId = c.user_id;
        div.innerHTML = `
        <img src="${c.profiles?.avatar_url || 'src/assets/avatar-placeholder.png'}" class="w-6 h-6 rounded-full mt-1 object-cover" loading="lazy" alt="Avatar">
        <div class="flex-1">
            <div class="bg-slate-50 p-2 rounded-lg relative">
                <div class="flex justify-between items-start">
                    <span class="font-bold text-slate-900 text-xs">${escapeHtml(c.profiles?.username || 'User')}</span>
                    ${deleteBtn}
                </div>
                <p class="text-slate-700 mt-1">${escapeHtml(c.content)}</p>
            </div>
        </div>`;
        container.appendChild(div);
    });
    if (window.lucide) {
        window.lucide.createIcons({ nodes: [container] });
    }
}

export async function handleCommentSubmit(supabase, currentUser, e) {
    e.preventDefault();
    const form = e.target;
    const postId = form.dataset.postId;
    const input = form.querySelector('input');
    const content = input.value.trim();

    if (!content || !currentUser) return;

    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;

    try {
        const { data, error } = await supabase.from('comments').insert({
            post_id: postId,
            user_id: currentUser.uid,
            content: content
        }).select(`id, user_id, content, created_at, profiles(username, avatar_url)`).single();

        if (error) throw error;

        input.value = '';
        const postCard = form.closest('.post-card');
        const commentSection = postCard.querySelector('.comment-section');
        const commentsList = commentSection.querySelector('.comments-list');

        if (commentsList.innerHTML.includes("No comments yet")) {
            commentsList.innerHTML = '';
        }

        const isOwner = currentUser && data.user_id === currentUser.uid;
        const deleteBtn = isOwner ? `
            <button class="delete-comment-btn text-slate-400 hover:text-red-500 transition p-1" title="Delete Comment" data-comment-id="${data.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>` : '';

        const div = document.createElement('div');
        div.className = "comment-item flex gap-2 mb-2 text-sm group";
        div.dataset.authorId = data.user_id;
        div.innerHTML = `
        <img src="${data.profiles?.avatar_url || 'src/assets/avatar-placeholder.png'}" class="w-6 h-6 rounded-full mt-1 object-cover" loading="lazy" alt="Avatar">
        <div class="flex-1">
            <div class="bg-slate-50 p-2 rounded-lg relative">
                <div class="flex justify-between items-start">
                    <span class="font-bold text-slate-900 text-xs">${escapeHtml(data.profiles?.username || 'User')}</span>
                    ${deleteBtn}
                </div>
                <p class="text-slate-700 mt-1">${escapeHtml(data.content)}</p>
            </div>
        </div>`;
        commentsList.appendChild(div);
        if (window.lucide) {
            window.lucide.createIcons({ nodes: [div] });
        }

        const countSpan = postCard.querySelector('.comment-btn span');
        if (countSpan) countSpan.textContent = parseInt(countSpan.textContent, 10) + 1;

        if (postCard.dataset.authorId && postCard.dataset.authorId !== currentUser.uid) {
            createNotification(supabase, currentUser, 'comment', postId, postCard.dataset.authorId);
        }

    } catch (err) {
        console.error("Comment submit error:", err);
        showToast("Failed to post comment.", "error");
    } finally {
        submitBtn.disabled = false;
    }
}

export async function handlePostAction(supabase, currentUser, e, inFlightLikes = new Set(), onDeleteSuccess = null) {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.dataset.requiresAuth === 'true' && !currentUser) {
        e.stopPropagation();
        showAuthGateModal();
        return;
    }

    const postId = btn.dataset.postId;

    // 1. THREE-DOT MENU TOGGLE
    if (btn.classList.contains('three-dot-btn')) {
        e.stopPropagation();
        const card = btn.closest('.post-card');
        const menu = card.querySelector('.post-dropdown-menu');
        const isVisible = menu.style.display === 'block';
        closeAllPostMenus();
        if (!isVisible) {
            menu.style.display = 'block';
        }
        return;
    }

    // 2. SHARE MENU TOGGLE
    if (btn.classList.contains('share-btn')) {
        e.stopPropagation();
        const card = btn.closest('.post-card');
        const menu = card.querySelector('.share-submenu');
        const isVisible = menu.style.display === 'block';
        closeAllPostMenus();
        if (!isVisible) {
            menu.style.display = 'block';
        }
        return;
    }

    // 3. COPY LINK / INSTAGRAM COPY
    if (btn.classList.contains('copy-link-btn') || btn.classList.contains('copy-link-share-btn') || btn.classList.contains('share-instagram-btn')) {
        const url = btn.dataset.postUrl;
        try {
            await navigator.clipboard.writeText(url);
            if (btn.classList.contains('share-instagram-btn')) {
                showToast("Link copied! Paste it in your Instagram story or message.", "success");
            } else {
                showToast("Link copied to clipboard!", "success");
            }
        } catch (err) {
            console.error("Clipboard copy error:", err);
            showToast("Failed to copy link.", "error");
        }
        closeAllPostMenus();
        return;
    }

    // 4. NATIVE SHARE
    if (btn.classList.contains('native-share-btn')) {
        const url = btn.dataset.postUrl;
        const title = btn.dataset.postTitle;
        if (navigator.share) {
            navigator.share({ title, url }).catch(err => console.warn("Native share cancelled:", err));
        }
        closeAllPostMenus();
        return;
    }

    // 5. ABOUT POST TOGGLE
    if (btn.classList.contains('about-post-btn')) {
        e.stopPropagation();
        const card = btn.closest('.post-card');
        const panel = card.querySelector('.about-post-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        return;
    }

    // 6. FOLLOW/UNFOLLOW FROM MENU
    if (btn.classList.contains('follow-from-menu-btn')) {
        closeAllPostMenus();
        const authorId = btn.dataset.authorId;
        const authorUsername = btn.dataset.authorUsername;
        const labelSpan = btn.querySelector('.follow-menu-label');
        const isFollowing = labelSpan.textContent.includes('Unfollow');

        if (isFollowing) {
            labelSpan.textContent = `Follow @${authorUsername}`;
            try {
                const { error } = await supabase.from('followers').delete().eq('follower_id', currentUser.uid).eq('following_id', authorId);
                if (error) throw error;
                showToast(`Unfollowed @${authorUsername}`, "info");
            } catch (err) {
                labelSpan.textContent = `Unfollow @${authorUsername}`;
                showToast("Failed to unfollow. Please try again.", "error");
                console.error(err);
            }
        } else {
            labelSpan.textContent = `Unfollow @${authorUsername}`;
            try {
                const { error } = await supabase.from('followers').insert({ follower_id: currentUser.uid, following_id: authorId });
                if (error) throw error;
                createNotification(supabase, currentUser, 'follow', null, authorId);
                showToast(`Following @${authorUsername}`, "success");
            } catch (err) {
                labelSpan.textContent = `Follow @${authorUsername}`;
                showToast("Failed to follow. Please try again.", "error");
                console.error(err);
            }
        }
        return;
    }

    // 7. SAVE/UNSAVE FROM MENU
    if (btn.classList.contains('save-from-menu-btn')) {
        closeAllPostMenus();
        const isSaved = btn.dataset.isSaved === '1';
        const labelSpan = btn.querySelector('.save-menu-label');
        const svg = btn.querySelector('svg');

        if (isSaved) {
            btn.dataset.isSaved = '0';
            labelSpan.textContent = 'Save post';
            btn.classList.remove('text-green-600');
            btn.classList.add('text-slate-700');
            if (svg) {
                svg.setAttribute('fill', 'none');
                svg.classList.remove('text-green-500');
                svg.classList.add('text-slate-500');
            }
            try {
                const { error } = await supabase.from('saved_posts').delete().eq('user_id', currentUser.uid).eq('post_id', postId);
                if (error) throw error;
            } catch (err) {
                btn.dataset.isSaved = '1';
                labelSpan.textContent = 'Unsave post';
                btn.classList.add('text-green-600');
                btn.classList.remove('text-slate-700');
                if (svg) {
                    svg.setAttribute('fill', 'currentColor');
                    svg.classList.add('text-green-500');
                    svg.classList.remove('text-slate-500');
                }
                showToast("Failed to unsave post.", "error");
            }
        } else {
            btn.dataset.isSaved = '1';
            labelSpan.textContent = 'Unsave post';
            btn.classList.add('text-green-600');
            btn.classList.remove('text-slate-700');
            if (svg) {
                svg.setAttribute('fill', 'currentColor');
                svg.classList.add('text-green-500');
                svg.classList.remove('text-slate-500');
            }
            try {
                const { error } = await supabase.from('saved_posts').insert({ user_id: currentUser.uid, post_id: postId });
                if (error) throw error;
            } catch (err) {
                btn.dataset.isSaved = '0';
                labelSpan.textContent = 'Save post';
                btn.classList.remove('text-green-600');
                btn.classList.add('text-slate-700');
                if (svg) {
                    svg.setAttribute('fill', 'none');
                    svg.classList.remove('text-green-500');
                    svg.classList.add('text-slate-500');
                }
                showToast("Failed to save post.", "error");
            }
        }
        return;
    }

    // 8. DELETE FROM MENU
    if (btn.classList.contains('delete-from-menu-btn')) {
        closeAllPostMenus();
        if (confirm("Delete this post?")) {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (!error) {
                btn.closest('.post-card').remove();
                showToast("Post deleted successfully", "success");
                if (onDeleteSuccess) onDeleteSuccess();
            } else {
                showToast("Error deleting post: " + error.message, "error");
            }
        }
        return;
    }

    // 9. LIKE
    if (btn.classList.contains('like-btn')) {
        if (inFlightLikes.has(postId)) return;
        inFlightLikes.add(postId);

        const countSpan = btn.querySelector('span');
        const icon = btn.querySelector('svg');
        const isLiked = btn.classList.contains('text-red-500');

        if (isLiked) {
            btn.classList.remove('text-red-500', 'bg-red-50');
            btn.classList.add('text-slate-500', 'hover:text-red-500', 'hover:bg-red-50');
            if (icon) icon.setAttribute('fill', 'none');
            countSpan.textContent = Math.max(0, parseInt(countSpan.textContent, 10) - 1);
            try {
                const { error } = await supabase.from('likes').delete().eq('user_id', currentUser.uid).eq('post_id', postId);
                if (error) throw error;
            } catch (err) {
                btn.classList.add('text-red-500', 'bg-red-50');
                btn.classList.remove('text-slate-500', 'hover:text-red-500', 'hover:bg-red-50');
                if (icon) icon.setAttribute('fill', 'currentColor');
                countSpan.textContent = parseInt(countSpan.textContent, 10) + 1;
                showToast("Failed to unlike post.", "error");
            }
        } else {
            btn.classList.add('text-red-500', 'bg-red-50');
            btn.classList.remove('text-slate-500', 'hover:text-red-500', 'hover:bg-red-50');
            if (icon) icon.setAttribute('fill', 'currentColor');
            countSpan.textContent = parseInt(countSpan.textContent, 10) + 1;
            try {
                const { error } = await supabase.from('likes').insert({ user_id: currentUser.uid, post_id: postId });
                if (error) throw error;
                const postCard = btn.closest('.post-card');
                if (postCard && postCard.dataset.authorId && postCard.dataset.authorId !== currentUser.uid) {
                    createNotification(supabase, currentUser, 'like', postId, postCard.dataset.authorId);
                }
            } catch (err) {
                btn.classList.remove('text-red-500', 'bg-red-50');
                btn.classList.add('text-slate-500', 'hover:text-red-500', 'hover:bg-red-50');
                if (icon) icon.setAttribute('fill', 'none');
                countSpan.textContent = Math.max(0, parseInt(countSpan.textContent, 10) - 1);
                showToast("Failed to like post.", "error");
            }
        }
        inFlightLikes.delete(postId);
    }

    // 10. COMMENT TOGGLE
    if (btn.classList.contains('comment-btn')) {
        const card = btn.closest('.post-card');
        const section = card.querySelector('.comment-section');
        const isHidden = section.style.display === 'none';
        section.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            loadComments(supabase, currentUser, postId, section.querySelector('.comments-list'));
        }
    }

    // 11. DELETE COMMENT
    if (btn.classList.contains('delete-comment-btn')) {
        const commentId = btn.dataset.commentId;
        if (confirm("Delete this comment?")) {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (!error) {
                const commentDiv = btn.closest('.comment-item');
                if (commentDiv) commentDiv.remove();

                const postCard = btn.closest('.post-card');
                const countSpan = postCard.querySelector('.comment-btn span');
                if (countSpan) countSpan.textContent = Math.max(0, parseInt(countSpan.textContent, 10) - 1);
            } else {
                showToast("Error deleting comment: " + error.message, "error");
            }
        }
    }
}

// ─── Client-side Image Compression Utility ──────────────────────────────────────
export async function compressImageToWebP(file, options = {}) {
    const COMPRESS_MAX_DIMENSION = options.maxDimension || 1920;
    const COMPRESS_QUALITY = options.quality || 0.82;
    const COMPRESS_MIN_QUALITY = 0.5;

    // Safety checks: skip GIFs and non-images
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
        return file;
    }

    try {
        // Load image into an Image object
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                resolve(img);
            };
            img.onerror = (e) => reject(new Error("Image decode failed"));
        });

        let width = image.width;
        let height = image.height;

        // Calculate scaled dimensions keeping aspect ratio
        if (width > COMPRESS_MAX_DIMENSION || height > COMPRESS_MAX_DIMENSION) {
            if (width > height) {
                height = Math.round((height * COMPRESS_MAX_DIMENSION) / width);
                width = COMPRESS_MAX_DIMENSION;
            } else {
                width = Math.round((width * COMPRESS_MAX_DIMENSION) / height);
                height = COMPRESS_MAX_DIMENSION;
            }
        }

        // Create virtual canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        // Encode to WebP
        let quality = COMPRESS_QUALITY;
        let blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/webp', quality);
        });

        if (!blob) {
            return file; // WebP encoding not supported by browser
        }

        // Stricter target size optimization loop (optional ceiling)
        if (options.targetBytes && blob.size > options.targetBytes) {
            while (quality > COMPRESS_MIN_QUALITY && blob.size > options.targetBytes) {
                quality -= 0.1;
                blob = await new Promise((resolve) => {
                    canvas.toBlob((b) => resolve(b), 'image/webp', quality);
                });
                if (!blob) break;
            }
        }

        if (!blob) {
            return file;
        }

        // Regression guard: if compressed version is larger, keep original
        if (blob.size >= file.size) {
            return file;
        }

        // Build new filename with .webp extension
        const origName = file.name;
        const baseName = origName.substring(0, origName.lastIndexOf('.')) || origName;
        const newName = `${baseName}.webp`;

        return new File([blob], newName, { type: 'image/webp', lastModified: Date.now() });

    } catch (err) {
        console.error("Image compression error:", err);
        return file; // Fallback to original file on decode errors
    }
}

// ─── Reusable Mobile Bottom Navigation Injector ────────────────────────────────
export function injectMobileBottomNav(activeTab) {
    let container = document.getElementById('mobile-nav-container');
    if (!container) {
        container = document.querySelector('.mobile-bottom-nav');
        if (!container) {
            container = document.createElement('div');
            container.id = 'mobile-nav-container';
            document.body.appendChild(container);
        } else {
            container.id = 'mobile-nav-container';
        }
    }

    const tabs = {
        home: { href: 'feed.html', icon: 'home', label: 'Home' },
        groups: { href: 'groups.html', icon: 'users-2', label: 'Groups' },
        saved: { href: 'save.html', icon: 'bookmark', label: 'Saved' },
        messages: { href: 'messages.html', icon: 'message-square', label: 'Msgs', isMsg: true },
        profile: { href: 'profile.html', icon: 'profile', label: 'Profile', isProfile: true }
    };

    let html = `<div class="mobile-bottom-nav shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">`;
    for (const [key, tab] of Object.entries(tabs)) {
        const isActive = key === activeTab;
        const activeClass = isActive ? 'active text-brand-blue' : '';

        if (tab.isProfile) {
            html += `
            <a href="${tab.href}" class="mobile-nav-item ${activeClass}">
                <img id="mobile-nav-profile-img" src="src/assets/avatar-placeholder.png"
                    class="w-6 h-6 rounded-full border border-slate-200 object-cover">
                <span>${tab.label}</span>
            </a>`;
        } else if (tab.isMsg) {
            html += `
            <a href="${tab.href}" class="mobile-nav-item relative ${activeClass}">
                <i data-lucide="${tab.icon}"></i>
                <span>${tab.label}</span>
                <span id="mobile-msg-badge" class="hidden absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </a>`;
        } else {
            html += `
            <a href="${tab.href}" class="mobile-nav-item ${activeClass}">
                <i data-lucide="${tab.icon}"></i>
                <span>${tab.label}</span>
            </a>`;
        }
    }
    html += `</div>`;

    container.outerHTML = html;

    if (window.lucide) {
        window.lucide.createIcons({ nodes: [document.querySelector('.mobile-bottom-nav')] });
    }
}

