import { ref } from "vue";

export function loginSubmit() {
  const email = ref();
  const password = ref();

  const submit = async () => {
    console.log("entrando a la funcion");
    console.log(email.value);
    console.log(password.value);
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    const data = await response.json();
    return data;
  };

  return {
    email,
    password,
    submit,
  };
}