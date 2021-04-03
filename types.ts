import { Scenes, Context } from 'telegraf'

export interface SignupSession extends Scenes.WizardSession {
  name: string;
  email: string;
  inviteLink: string;
}
  
export interface SignupContext extends Context {
  session: SignupSession
  scene: Scenes.SceneContextScene<SignupContext, Scenes.WizardSessionData>
  wizard: Scenes.WizardContextWizard<SignupContext>
}