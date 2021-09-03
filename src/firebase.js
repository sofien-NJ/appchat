import fire from 'firebase/app' 
import 'firebase/auth' 
import 'firebase/firestore'

import { ref, onUnmounted, computed } from '@vue/reactivity'

var firebaseConfig = {
    apiKey: "AIzaSyCBu2xVN4qQimw-1_snSduOiYAQjo1znRg",
    authDomain: "vue-chat-df2f2.firebaseapp.com",
    projectId: "vue-chat-df2f2",
    storageBucket: "vue-chat-df2f2.appspot.com",
    messagingSenderId: "848045824375",
    appId: "1:848045824375:web:1be4580ace4ef710756972"
  }
const auth = firebase.auth()
export function useAuth() {
    const user = ref(null)
    const unsubscribe = auth.onAuthStateChanged(_user => (user.value = _user))
    onUnmounted(unsubscribe)
    const isLogin = computed(() => user.value !== null)
    
    const signIn = async () => {
        const googleProvider = new firebase.auth.GoogleAuthProvider()
        await auth.signInWithPopup(googleProvider)
    }
    const signOut = () => auth.signOut()
    return { user, isLogin, signIn, signOut }
}

const firestore = firebase.firestore()
const messagesCollection = firestore.messagesCollection('messages')
const messagesQuery = messagesCollection.orderBy('createdAt', 'desc').limit(100)

export function useChat() {
    const messages = ref([])
    const unsubscribe = messagesQuery.onSnapshot(onSnapshot => {
        messages.value = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data()}))
            .reverse()
    })
    onUnmounted(unsubscribe)
    const { user, isLogin } = useAuth()
    const sendMessage = text => {
        if (!isLogin.value) return
        const { photoURL, uid, displayName } = user.value
        messagesCollection.add ({
            userName: displayName,
            userId:uid,
            userPhotoURL: photoURL,
            text: text,
            createdAt: firebase.firestore.fieldValue.Timestamp()
        })
    }
    return { messages, sendMessage}
}