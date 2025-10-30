// testUpdateUsers.ts
const API_URL = 'http://localhost:3000/api/users'; // Your bulk update endpoint

// Sample users array to update
const usersToUpdate = [
  {
    user_id: 1,
    first_name: "Amrit",
    last_name: "Techie",
    email: "amrit@example.com",
    phone_number: "0712345678",
    password: "newPass123"
  },
  {
    user_id: 2,
    first_name: "Kie",
    last_name: "Brown",
    email: "kie@example.com",
    phone_number: "0798765432",
    password: "kiePass321"
  }
];

(async () => {
  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usersToUpdate)
    });

    const data = await res.json();
    console.log('✅ Response:', data);
  } catch (error) {
    console.error('❌ Error hitting API:', error);
  }
})();
