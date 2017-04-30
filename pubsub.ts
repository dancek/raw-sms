type ChangeType = string;
type Subscriber = (change: Change) => void;
type Subscription = [Subscriber, ChangeType | undefined];

export class Change {
    type: ChangeType;
    data: object;
}

export class Publisher {
    private subscriptions: Subscription[] = new Array<Subscription>();

    // calling with no parameters: everything changed
    publish(change?: Change) {
        this.subscriptions.forEach(([f, type]) => {
            if (change === undefined || type === undefined || type === change.type) {
                f(change);
            }
        });
    }

    subscribe(f: Subscriber, type?: ChangeType) {
        this.subscriptions.push([f, type]);
    }
}