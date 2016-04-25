require 'mina/git'

set :domain, 'editor.codeassign.com'
set :user, 'titus'
set :forward_agent, true
set :deploy_to, '/var/www/codeassign-editor'
set :repository, 'git@github.com:codeassign/codeassign-editor.git'
set :branch, 'master'

desc "Deploys the current version to the server."
task :deploy => :environment do
  deploy do
    invoke :'git:clone'
    invoke :'deploy:cleanup'
  end
end
