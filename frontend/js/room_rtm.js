let addMemberToDom = async (MemberId) => {
    //let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${MemberId}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}