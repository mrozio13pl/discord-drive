import { Route, Switch } from 'wouter-preact';
import { Driver } from './driver';

export function Main() {
    // more routes soon
    return (
        <Switch>
            <Route path="/">
                <Driver />
            </Route>
        </Switch>
    );
}
