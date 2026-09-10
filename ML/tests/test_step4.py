import httpx

# 1. Create a temporary session
sess_res = httpx.post('http://127.0.0.1:5000/api/sessions', json={'isPersistent': False, 'title': 'Test Temp Session'})
sess = sess_res.json()['session']
sess_id = sess['id']
print('Created temp session:', sess_id, 'isPersistent:', sess['isPersistent'])

# 2. Send a message to chat stream
with httpx.stream('POST', 'http://127.0.0.1:5000/api/chat', json={'sessionId': sess_id, 'message': 'Say STEP4_VERIFIED', 'isPersistent': False}, timeout=60.0) as r:
    for chunk in r.iter_text():
        pass

# 3. Retrieve messages for that session
msgs_res = httpx.get(f'http://127.0.0.1:5000/api/sessions/{sess_id}/messages')
msgs = msgs_res.json()['messages']
print('Retrieved messages count:', len(msgs))
for m in msgs:
    print(f"  [{m['role']}]: {m['content']}")
