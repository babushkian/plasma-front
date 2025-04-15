import { useLocation } from "react-router-dom"
export function OrderDetails() {
    const {state} = useLocation()
    console.log(location)
    return <>Детели заказа {state.WONumber}</>
}
