# Auto Assign User & Add Label



## Usage

1. First you need to checkout your code . -- uses: actions/checkout@v3 
2. Use our plugin  -- uses: lythro10/label-project-assign@main


Required Inputs which are required by our plugin are
1. GITHUB_TOKEN --  will need your GitHub Token
2. selected_system -- for which dropdown item from the dropdown to run for (can be multiple)
3. regexToMatch -- Write your own regex to to match the input


Within the env: 

Label -- if you want to add a label to the issue you write for which selected_system you want to put the label and then the labels you want. (If the label does not already exists it will create it ) 

Assignees -- If you want to assign users to the issue write where {selected_sysem} your dropdown choice and the GitHub username you would like to assign. (They would need to have access to the repo to be assigned. )



    - name: Checkout code
      uses: actions/checkout@v3

      - name: Label Assign Project
        uses: lythro10/label-project-assign@main
        env:
          {selected_sysem}_label: label1, label2
          {selected_system}_assignees: github_user
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
          selected_system: {selected_system},{selected_system},{selected_system}, {selected_system}
          regexToMatch: 'REGEX'

