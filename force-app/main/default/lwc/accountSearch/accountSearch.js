import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import getAccountListings from '@salesforce/apex/AccountListingController.getAccountListings';


const actions = [

    { label: 'Edit', name: 'edit' }
];
const columns = [
    {
        label: 'Name', fieldName: 'viewLink', type: 'url', sortable: true,
        typeAttributes: {
            label: { fieldName: 'Name' },
            target: '_blank'
        }
    },
    { label: 'Owner', fieldName: 'ownerName', type: 'text', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Website', fieldName: 'Website', type: 'url' },
    { label: 'AnnualRevenue', fieldName: 'AnnualRevenue', type: 'currency' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    }
];


export default class AccountSearch extends NavigationMixin(LightningElement) {
    @track data = [];
    @track error;

    
    columns = columns;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    filterKey = '';
    delayTimeout;

    // Can be exposed as design variable to change the title 
    @api title = 'Financial Services Account Listing';


    //fetch financial services accounts
    @wire(getAccountListings, { nameFilter: '$filterKey' })
    wiredAccounts({
        error,
        data }) {
        if (data) {
            let details = JSON.parse(JSON.stringify(data))
            this.data = details.map(item => {
                item.ownerName = item.Owner.Name;
                item.viewLink = '/' + item.Id
                return item;
            });
        }
        else if (error) {
            this.error = error;
        }
    }
    //handlers
    handleSearch(event) {
        window.clearTimeout(this.delayTimeout);
        const filterKey = event.target.value;

        this.delayTimeout = setTimeout(() => {
            this.filterKey = filterKey;
        }, 1000);

    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'edit':
                this.editRow(row);
                break;
            default:
        }
    }

    editRow(row) {
        const id = row.Id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: id,
                actionName: 'edit',
            },
        });

    }
    //sorting logic
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                return primer(x[field]);
            }
            : function (x) {
                return x[field];
            };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}