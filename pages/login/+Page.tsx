import { ChangeEvent, useRef, useState } from "react";
import Input from "@components/Input";
import Button from "@components/Button";
import { postgrest } from "@src/utils/postgrest";
import { usePageContext } from "vike-react/usePageContext";
import { saveAuth } from "@src/utils/auth";
import { navigate } from "vike/client/router";
import Logo from "@components/Logo";
import { createValyn } from "valync/react";

const useLogin = createValyn({
    client: async (_, init) => {
        const form = init.body as unknown as Record<string, any>;
        const { data, error } = await postgrest.rpc("login", form);
        if (error)
            return {
                status: "failed",
                error: {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                },
            };
        return {
            status: "success",
            data: data,
        };
    },
    options: {
        cache: false,
        fetchOnMount: false,
    },
});

export default function () {
    const [form, setFormState] = useState({ email: "", password: "" });
    const ref = useRef<HTMLFormElement>(null);
    const context = usePageContext();
    const [state, onLogin] = useLogin<{
        access_token: string;
        refresh_token: string;
    }>("auth/login", {
        onSuccess: (data) => {
            saveAuth(context, data);
            navigate("/");
        },
    });

    const onSubmit = async () => {
        const isValid = ref.current?.checkValidity();
        if (!isValid) return;
        onLogin("POST", form as unknown as BodyInit);
    };

    const _setFormState = (ev: ChangeEvent<HTMLInputElement>) =>
        setFormState({ ...form, [ev.target.name]: ev.target.value });

    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center">
            <form
                ref={ref}
                onSubmit={(ev) => {
                    ev.preventDefault();
                    onSubmit();
                }}
                className="mx-auto max-w-lg w-full flex flex-col gap-3 place-items-center p-8 rounded-md shadow-md px-12"
            >
                <Logo />
                <div>Welcome Back</div>
                {state.when({
                    error: (err) => (
                        <div className="text-red-500 text-sm">
                            {err.message}
                        </div>
                    ),
                })}
                <Input
                    required
                    name="email"
                    placeholder="acme@gmail.com"
                    type="email"
                    autoComplete="username"
                    onChange={_setFormState}
                />
                <Input
                    required
                    name="password"
                    placeholder="password"
                    type="password"
                    autoComplete="current-password"
                    onChange={_setFormState}
                />
                <Button
                    title="Login"
                    className="bg-green-500 disabled:bg-zinc-500"
                    disabled={state.isLoading()}
                />
            </form>
        </div>
    );
}
