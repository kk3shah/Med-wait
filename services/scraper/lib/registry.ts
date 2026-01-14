import { BaseAdapter } from './adapters/base';
import { GenericSelectorAdapter } from './adapters/generic';
import { JsonEndpointAdapter } from './adapters/json';
import { RegexAdapter } from './adapters/regex';

export class AdapterRegistry {
    private adapters: Map<string, BaseAdapter> = new Map();

    constructor() {
        this.registerDefaults();
    }

    register(key: string, adapter: BaseAdapter) {
        this.adapters.set(key, adapter);
    }

    get(key: string): BaseAdapter | undefined {
        return this.adapters.get(key);
    }

    private registerDefaults() {
        // Standard UHN Adapter (Generic Selector)
        this.register('uhn_generic', new GenericSelectorAdapter({
            waitTime: '.waiting-time-value',
            lastUpdated: '.last-updated-date'
        }));

        // Standard Sinai Adapter
        this.register('sinai_generic', new GenericSelectorAdapter({
            waitTime: '.ed-wait-time-clock',
            lastUpdated: '.ed-wait-time-as-of'
        }));

        // Example JSON Adapter for hospitals that expose cleaner APIs
        this.register('json_generic', new JsonEndpointAdapter({
            waitTime: 'currentWaitMinutes',
            lastUpdated: 'updatedAt'
        }));

        // Example Regex Adapter for very simple text-only pages
        this.register('regex_generic', new RegexAdapter({
            waitTime: /Emergency Wait: (\d+) mins/i,
            lastUpdated: /Updated at: (.*)/i
        }));

        // Add more specific adapters as discovered during tuning
    }
}
