// prettier-ignore
const injectConfig = () => {
    const ops = nyaaUtility.storage.user.options;

    const AutoNextPage = nyaaUtility.utils.snippets.getCheckBox(
        "Go to next page when the current page is empty.",
        "AutoNextPage",
        ops.AutoNextPage
    );

    const NyaaUserBlocks = nyaaUtility.utils.snippets.getCheckBox(
        "Disable the user blocking function",
        "NyaaUserBlocks",
        ops.NyaaUserBlocks
    );

    const commentDateTime = nyaaUtility.utils.snippets.getCheckBox(
        "Converts '2 months ago' to '" + (()=> {
            const d = new Date();
            const month = (d.getMonth() - 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            const year = d.getFullYear();
            const hours = d.getHours().toString().padStart(2, '0');;
            const minutes = d.getMinutes().toString().padStart(2, '0');;
            const seconds = d.getSeconds().toString().padStart(2, '0');;
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        })() + "'",
        "NyaaCommentDate",
        ops.commentPostedAtTime
    );

    const blockedUsers = nyaaUtility.utils.snippets.getListBox(
        "Blocked Users:",
        "blockedUsersNyaa",
        ops.nyaaBlockedUsers,
        "blockedUser",
        "unblock",
        "No blocked users were found."
    );

    const deadTorrentRemovalRule = nyaaUtility.utils.snippets.getDropdownList(
        "DeadTorrent removeRule:",
        "removeDeadTorrentsRule",
        ['disabled', 'both', 'seeds', 'leechers'],
        ops.NyaaRemoveRule
    )


    const resetBtn = `
        <input
            class="btn btn-primary btn-danger" 
            id="reset" name="reset"
            type="button" value="Reset"
        >
    `

    $("#preferences-change > form > .row")
        .first()
        .before(deadTorrentRemovalRule)
        .after(AutoNextPage + NyaaUserBlocks + commentDateTime + blockedUsers);
    $('#submit_settings').after(resetBtn)
    $('input#reset').on('click', () => {
        if (confirm('Are you sure you want to reset all of the settings to the default?\nNote: This will also unblock all the blocked users.')) {
            chrome.storage.sync.clear(() => {
                window.location.reload()
            })
        }
    })

    {
        document.querySelectorAll('#blockedUsersNyaa > li').forEach((li) => {
            li.onclick = () => {
                const link = li.querySelector('a').href
                // https://nyaa.si/user/XXXXXXX
                const user = link.match(/user\/(.*)/);
                if (!user) {
                    return
                }
                const ops = nyaaUtility.storage.user.options
                ops.nyaaBlockedUsers = ops.nyaaBlockedUsers.filter(usr => usr.match(/user\/(.*)/)[1] != user[1])
                nyaaUtility.settings.save()
                window.location.reload()
            }
        });
    }

    document.getElementById("submit_settings").addEventListener(
        "click",
        () => {
            nyaaUtility.storage.user.options.AutoNextPage = document.querySelector("input#AutoNextPage").checked;
            nyaaUtility.storage.user.options.NyaaUserBlocks = document.querySelector("input#NyaaUserBlocks").checked;
            nyaaUtility.storage.user.options.NyaaRemoveRule = document.querySelector("select#removeDeadTorrentsRule").value;
            nyaaUtility.storage.user.options.commentPostedAtTime = document.querySelector('#NyaaCommentDate').checked;
            nyaaUtility.settings.save()
            window.location.reload()
        },
        false
    );
};

if (window.location.href.includes("/profile")) {
    nyaaUtility.storage.system.onload(() => {
        {
            /*
                Changes the active tab to the preferences one
                instead of the "change password" one.
            */
            classes = ["active", "in"];
            for (let class_ of classes) {
                $("#password-change").toggleClass(class_);
                $("#preferences-change").toggleClass(class_);
            }

            $("#profileTabs > li:nth-child(1)").toggleClass("active");
            $("#profileTabs > li:nth-child(3)").toggleClass("active");
            $("#submit_settings").attr("value", "Save");
            injectConfig();
        }
    });
} else if (window.location.href.includes("/settings")) {
    const container = document.querySelector("body > div.container");

    document.querySelector("title").innerText = "Edit Settings :: Nyaa";

    container.outerHTML = `
    <div class="container">

            <h2 style="margin-bottom: 20px;">Settings for <strong class="text-default">${nyaaUtility.userName}</strong></h2>

            <div class="tab-content">
                <div class="tab-pane fade active in" role="tabpanel" id="preferences-change" aria-labelledby="preferences-change-tab">
                    <form>
                        <div class="row">
                            <div class="form-group col-md-4">
                                    <input id="hide_comments" name="hide_comments" type="checkbox" value="y">
                                    <label for="hide_comments">Hide comments by default</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4">
                                <input class="btn btn-primary" id="submit_settings" name="submit_settings" type="button" value="Update">
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <hr>
		</div>
        `;
    nyaaUtility.storage.system.onload(injectConfig);
}