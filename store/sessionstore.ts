import {create} from 'zustand'

interface userStore{
    session : string,
    setSession : (session : string) => void,
    userId :string,
    setUserId : (userId : string)  => void,
    email : string,
    setEmail : (email : string) => void,
    username : string,
    setUserName : (username : string) => void,
}

export const useSessionStore = create<userStore>((set) => ({
    session : "",
    setSession : (session) => set({session : session}),
    email : "",
    setEmail : (email) => set({email : email}),
    userId : "",
    setUserId : (userid) => set({userId : userid}),
    username : "",
    setUserName : (username) => set({username : username}),

}));