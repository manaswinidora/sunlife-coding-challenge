/**
 * Account listing funtionality for Sun Life
 * 
 * @author Manaswini Dora
 * @date 2nd August 2022
 * 
 * 
 */

public with sharing class AccountListingController {


    /**
     * Returns list of accounts where industry is Financial Services.  
     *
     * @param  nameFilter  Filter term for filtering the accounts by name.
     * @return   List of Accounts
     */

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountListings(string nameFilter) {
        if(String.IsBlank(nameFilter)){
            return [SELECT Id, Name, owner.name, 
                Phone, Website, AnnualRevenue
            FROM Account where Industry =:'Financial Services' Limit 200];
        }
        else{
            String nameFilterTerm = '%'+ nameFilter + '%';
            return [SELECT Id, Name, owner.name, 
                Phone, Website, AnnualRevenue
            FROM Account where Industry =:'Financial Services' AND Name LIKE :nameFilterTerm Limit 200];
        }
        
    }
}
