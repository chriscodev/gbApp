export function addIdClientId(data, btnAction, id, clientId, editBtnType=null) {
    delete data['clientId'];
    delete data['id'];
    if(btnAction === 'add') data['clientId'] = clientId;
    else { 
        if(editBtnType!==null && editBtnType==="add") data['clientId'] = clientId;
        else data['id'] = id;
    }
    return data;
} 
